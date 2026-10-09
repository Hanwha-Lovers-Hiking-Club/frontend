const MAX_PREVIEW_FILE_SIZE = 25 * 1024 * 1024;
const MAX_PREVIEW_WIDTH = 360;
const PREVIEW_JPEG_QUALITY = 0.78;
const DOCX_PREVIEW_PIXEL_RATIO = 0.5;
const SPREADSHEET_PREVIEW_COLUMNS = 6;
const SPREADSHEET_PREVIEW_ROWS = 8;

export type DocumentPreview = {
  url: string;
  isObjectUrl?: boolean;
};

function getExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase();
}

export function canGenerateDocumentPreview(file: File) {
  const extension = getExtension(file);
  return file.size <= MAX_PREVIEW_FILE_SIZE && ["pdf", "docx", "xlsx", "pptx"].includes(extension ?? "");
}

export async function generateDocumentPreview(file: File): Promise<DocumentPreview | undefined> {
  const extension = getExtension(file);

  if (!canGenerateDocumentPreview(file)) return undefined;
  if (extension === "pdf") return asDataUrl(renderPdfFirstPage(file));
  if (extension === "docx") {
    return (await extractOfficeEmbeddedThumbnail(file)) ?? asDataUrl(renderDocxFirstPage(file));
  }
  if (extension === "xlsx") {
    return (await extractOfficeEmbeddedThumbnail(file)) ?? asDataUrl(renderSpreadsheetFirstSheet(file));
  }
  if (extension === "pptx") return extractOfficeEmbeddedThumbnail(file);

  return undefined;
}

async function asDataUrl(preview: Promise<string | undefined>): Promise<DocumentPreview | undefined> {
  const url = await preview;
  return url ? { url } : undefined;
}

async function extractOfficeEmbeddedThumbnail(file: File): Promise<DocumentPreview | undefined> {
  try {
    const { default: JSZip } = await import("jszip");
    const archive = await JSZip.loadAsync(file);
    const thumbnail =
      archive.file("docProps/thumbnail.jpeg") ??
      archive.file("docProps/thumbnail.jpg") ??
      archive.file("docProps/thumbnail.png");

    if (!thumbnail) return undefined;

    return {
      url: URL.createObjectURL(await thumbnail.async("blob")),
      isObjectUrl: true,
    };
  } catch {
    return undefined;
  }
}

async function renderDocxFirstPage(file: File): Promise<string | undefined> {
  try {
    const [{ renderAsync }, { toJpeg }] = await Promise.all([
      import("docx-preview"),
      import("html-to-image"),
    ]);
    const host = document.createElement("div");

    host.style.cssText = "position:fixed;left:-10000px;top:0;width:794px;background:#fff;pointer-events:none;";
    document.body.append(host);

    try {
      await renderAsync(await file.arrayBuffer(), host, host, {
        breakPages: true,
        useBase64URL: true,
        renderChanges: false,
      });

      const firstPage = host.querySelector<HTMLElement>("section.docx");
      if (!firstPage) return undefined;

      const pageWidth = Math.ceil(firstPage.getBoundingClientRect().width);
      const pageHeight = Math.ceil(
        Number.parseFloat(getComputedStyle(firstPage).minHeight) || pageWidth * 1.414,
      );

      return await toJpeg(firstPage, {
        width: pageWidth,
        height: pageHeight,
        pixelRatio: DOCX_PREVIEW_PIXEL_RATIO,
        quality: PREVIEW_JPEG_QUALITY,
        style: {
          height: `${pageHeight}px`,
          maxHeight: `${pageHeight}px`,
          overflow: "hidden",
        },
      });
    } finally {
      host.remove();
    }
  } catch {
    return undefined;
  }
}

async function renderPdfFirstPage(file: File): Promise<string | undefined> {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();

    const source = {
      data: new Uint8Array(await file.arrayBuffer()),
      enableScripting: false,
    } as Parameters<typeof pdfjs.getDocument>[0];
    const loadingTask = pdfjs.getDocument(source);
    const pdf = await loadingTask.promise;
    try {
      const page = await pdf.getPage(1);
      const initialViewport = page.getViewport({ scale: 1 });
      const scale = Math.min(1.5, MAX_PREVIEW_WIDTH / initialViewport.width);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);

      const context = canvas.getContext("2d");
      if (!context) return undefined;

      await page.render({ canvas, canvasContext: context, viewport }).promise;
      return canvas.toDataURL("image/jpeg", PREVIEW_JPEG_QUALITY);
    } finally {
      await loadingTask.destroy();
    }
  } catch {
    return undefined;
  }
}

async function renderSpreadsheetFirstSheet(file: File): Promise<string | undefined> {
  try {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const xlsxLoader = workbook.xlsx as unknown as {
      load(buffer: ArrayBuffer): Promise<unknown>;
    };
    await xlsxLoader.load(await file.arrayBuffer());
    const firstSheet = workbook.worksheets[0];
    if (!firstSheet) return undefined;

    const columnCount = SPREADSHEET_PREVIEW_COLUMNS;
    const rowCount = SPREADSHEET_PREVIEW_ROWS;
    const canvas = document.createElement("canvas");
    const width = 640;
    const height = 360;
    const headerHeight = 44;
    const rowHeight = (height - headerHeight) / rowCount;
    const columnWidth = width / columnCount;
    const context = canvas.getContext("2d");

    if (!context) return undefined;

    canvas.width = width;
    canvas.height = height;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);

    context.fillStyle = "#ecfdf5";
    context.fillRect(0, 0, width, headerHeight);
    context.strokeStyle = "#d1d5db";
    context.lineWidth = 1;
    context.font = "500 18px Arial, sans-serif";
    context.textBaseline = "middle";

    for (let column = 0; column < columnCount; column += 1) {
      const x = column * columnWidth;
      context.fillStyle = "#047857";
      context.fillText(getSpreadsheetColumnLabel(column), x + 18, headerHeight / 2);
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    context.beginPath();
    context.moveTo(width, 0);
    context.lineTo(width, height);
    context.stroke();

    for (let row = 0; row < rowCount; row += 1) {
      const y = headerHeight + row * rowHeight;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();

      for (let column = 0; column < columnCount; column += 1) {
        const value = firstSheet.getCell(row + 1, column + 1).text;

        context.fillStyle = "#3f3f46";
        context.font = "400 16px Arial, sans-serif";
        context.fillText(
          truncateCanvasText(context, value, columnWidth - 28),
          column * columnWidth + 14,
          y + rowHeight / 2,
        );
      }
    }

    context.beginPath();
    context.moveTo(0, height);
    context.lineTo(width, height);
    context.stroke();

    return canvas.toDataURL("image/jpeg", PREVIEW_JPEG_QUALITY);
  } catch {
    return undefined;
  }
}

function getSpreadsheetColumnLabel(index: number) {
  let column = index + 1;
  let label = "";

  while (column > 0) {
    const remainder = (column - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    column = Math.floor((column - 1) / 26);
  }

  return label;
}

function truncateCanvasText(context: CanvasRenderingContext2D, value: string, maxWidth: number) {
  if (context.measureText(value).width <= maxWidth) return value;

  let result = value;
  while (result.length > 0 && context.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }

  return `${result}…`;
}
