import { mkdir, readdir } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "https://hanwha-job-knowledge.vercel.app";
const documentDirectory = process.env.DEMO_DOCUMENT_DIR
  ?? "C:\\Users\\gydud\\OneDrive\\Desktop\\시연 프로젝트\\inputs\\project_ai_agent_demo";
const outputDirectory = resolve("artifacts", "demo-video");
const supportedExtensions = new Set([".pdf", ".docx", ".xlsx", ".txt", ".md"]);
const firstQuestion = "정산 시스템을 새로 만들고 있어. 같은 돈이 두 번 지급되는 사고를 막고 싶은데, 이전 프로젝트에서 겪었던 문제와 해결 방법 중 참고할 만한 게 있을까?";
const followUpQuestion = "우리도 같은 사고를 막았는지 확인하고 싶어. 이전 프로젝트에서 실제로 시험한 상황을 바탕으로 테스트 체크리스트를 만들어줘.";
const cursorPosition = { x: 1100, y: 120 };

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function demoFiles() {
  const entries = await readdir(documentDirectory, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && supportedExtensions.has(extname(entry.name).toLowerCase()))
    .map((entry) => join(documentDirectory, entry.name));

  if (files.length === 0) {
    throw new Error(`업로드할 문서를 찾지 못했습니다: ${documentDirectory}`);
  }
  return files;
}

async function moveCursor(page, targetX, targetY, duration = 700) {
  const steps = Math.max(12, Math.round(duration / 35));
  const startX = cursorPosition.x;
  const startY = cursorPosition.y;

  for (let step = 1; step <= steps; step += 1) {
    const progress = step / steps;
    const x = startX + (targetX - startX) * progress;
    const y = startY + (targetY - startY) * progress;
    await page.mouse.move(x, y);
    await page.evaluate(({ x: cursorX, y: cursorY }) => {
      const cursor = document.getElementById("demo-cursor");
      if (cursor) cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
    }, { x, y }).catch(() => {});
    await sleep(duration / steps);
  }

  cursorPosition.x = targetX;
  cursorPosition.y = targetY;
}

async function showClick(page) {
  await page.evaluate(() => {
    const cursor = document.getElementById("demo-cursor");
    cursor?.classList.add("demo-cursor-click");
    window.setTimeout(() => cursor?.classList.remove("demo-cursor-click"), 180);
  }).catch(() => {});
}

async function moveAndClick(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: "visible" });
  const box = await locator.boundingBox();
  if (!box) throw new Error("클릭할 요소의 위치를 찾지 못했습니다.");

  await moveCursor(page, box.x + box.width * 0.5, box.y + box.height * 0.5);
  await sleep(750);
  await showClick(page);
  await locator.click();
  await sleep(1_700);
}

async function browsePage(page, distances) {
  for (const distance of distances) {
    await moveCursor(page, 1160, 640, 450);
    await page.mouse.wheel(0, distance);
    await sleep(1_500);
  }
}

async function ask(page, question, responseIndex) {
  const prompt = page.getByPlaceholder("문서와 프로젝트에 대해 무엇이든 물어보세요");
  await prompt.scrollIntoViewIfNeeded();
  const box = await prompt.boundingBox();
  if (box) await moveCursor(page, box.x + box.width * 0.45, box.y + box.height * 0.5);
  await sleep(700);
  await prompt.fill(question);
  await sleep(1_400);
  await moveAndClick(page, page.getByRole("button", { name: "질문 전송" }));
  await page.getByRole("button", { name: "답변 근거" }).nth(responseIndex).waitFor({
    state: "visible",
    timeout: 180_000,
  });
  await sleep(1_500);
}

const files = await demoFiles();
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir: outputDirectory, size: { width: 1440, height: 900 } },
});
await context.addInitScript(() => {
  const mountCursor = () => {
    if (document.getElementById("demo-cursor")) return;
    const cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.style.cssText = "position:fixed;top:0;left:0;z-index:2147483647;width:18px;height:18px;border:2px solid #f97316;border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 2px 10px rgba(0,0,0,.28);pointer-events:none;transform:translate(1100px,120px);transition:width .12s,height .12s,margin .12s;";
    const style = document.createElement("style");
    style.textContent = ".demo-cursor-click{width:10px!important;height:10px!important;margin:4px!important}";
    document.head.append(style);
    document.documentElement.append(cursor);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountCursor, { once: true });
  else mountCursor();
});
const page = await context.newPage();
const video = page.video();

try {
  await page.goto(`${baseUrl}/upload`, { waitUntil: "networkidle" });
  await sleep(1_200);

  await page.locator('input[type="file"]').setInputFiles(files);
  await page.getByRole("heading", { name: "업로드할 문서를 확인하세요." }).waitFor();
  await sleep(1_200);
  await moveAndClick(page, page.getByRole("button", { name: "업로드 시작" }));

  const projectLink = page.getByRole("link", { name: "프로젝트 폴더 보기" });
  await projectLink.waitFor({ state: "visible", timeout: 600_000 });
  await sleep(2_500);
  await moveAndClick(page, projectLink);
  await browsePage(page, [420, 320]);

  const firstCard = page.locator('article[role="button"]').first();
  await moveAndClick(page, firstCard);
  await page.getByText("지식 상세", { exact: true }).waitFor();
  await sleep(2_000);
  await moveAndClick(page, page.getByRole("button", { name: "닫기" }));
  await browsePage(page, [-900]);

  const projectUrl = page.url();
  const originalDocument = page.locator('[aria-label$="원본 열기"]').first();
  const popupPromise = context.waitForEvent("page");
  await moveAndClick(page, originalDocument);
  const documentPage = await popupPromise;
  await documentPage.waitForURL(/^(?!about:blank$).+/, { timeout: 60_000 });
  const documentUrl = documentPage.url();
  await documentPage.close();

  // shortcut: Playwright records one page at a time, so show the PDF in the recorded tab; use an OS recorder to capture a separate tab.
  await page.goto(documentUrl, { waitUntil: "domcontentloaded" });
  await sleep(3_000);
  await page.goto(projectUrl, { waitUntil: "networkidle" });
  await sleep(1_800);

  await page.goto(`${baseUrl}/knowledge`, { waitUntil: "networkidle" });
  await sleep(1_800);
  await moveAndClick(page, page.getByRole("link", { name: "전체 카드" }));
  await browsePage(page, [380]);
  const cardSearch = page.getByRole("searchbox", { name: "지식카드 검색" });
  await cardSearch.scrollIntoViewIfNeeded();
  await cardSearch.fill("보상");
  await sleep(1_000);
  await moveAndClick(page, page.getByRole("button", { name: "검색", exact: true }));
  await sleep(2_000);
  await browsePage(page, [360, -360]);

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await sleep(1_800);
  await ask(page, firstQuestion, 0);
  await moveAndClick(page, page.getByRole("button", { name: "답변 근거" }).first());
  await sleep(1_800);
  const referencedCard = page.getByRole("button", { name: /^지식카드/ }).last();
  await moveAndClick(page, referencedCard);
  await sleep(1_800);
  await moveAndClick(page, page.getByRole("button", { name: "닫기" }));

  await ask(page, followUpQuestion, 1);
  await moveAndClick(page, page.getByRole("button", { name: "답변 근거" }).last());
  await sleep(2_500);
} finally {
  await context.close();
  await browser.close();
}

const outputPath = join(outputDirectory, "job-knowledge-demo.webm");
await video.saveAs(outputPath);
console.log(`시연 영상 저장 완료: ${basename(outputPath)}`);
