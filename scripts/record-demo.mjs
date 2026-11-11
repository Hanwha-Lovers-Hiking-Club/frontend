import { mkdir, readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "https://hanwha-job-knowledge.vercel.app";
const documentDirectory = process.env.DEMO_DOCUMENT_DIR
  ?? join(homedir(), "Desktop", "시연 프로젝트", "inputs", "project_refund_agent");
const outputDirectory = resolve("artifacts", "demo-video");
const supportedExtensions = new Set([".pdf", ".docx", ".xlsx", ".txt", ".md"]);
const firstQuestion = "정산 시스템을 새로 만들고 있어. 같은 돈이 두 번 지급되는 사고를 막고 싶은데, 이전 프로젝트에서 겪었던 문제와 해결 방법 중 참고할 만한 게 있을까?";
const followUpQuestion = "우리도 같은 사고를 막았는지 확인하고 싶어. 이전 프로젝트에서 실제로 시험한 상황을 바탕으로 테스트 체크리스트를 만들어줘.";
const viewport = { width: 1440, height: 900 };
const detailPanelPoint = { x: 1070, y: 520 };
const cursorPosition = { x: 1100, y: 120 };

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const easeInOut = (t) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
// 사람처럼 매번 조금씩 다른 박자로 쉰다.
const hold = (milliseconds) => sleep(milliseconds * (0.9 + Math.random() * 0.2));

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

// 가속-감속 + 살짝 휘는 궤적. 커서 표시는 initScript의 mousemove 리스너가 따라간다.
async function moveCursor(page, targetX, targetY, duration) {
  const startX = cursorPosition.x;
  const startY = cursorPosition.y;
  const dx = targetX - startX;
  const dy = targetY - startY;
  const distance = Math.hypot(dx, dy);
  if (distance < 2) return;

  const totalDuration = duration ?? clamp(450 + distance * 0.8, 450, 1_300);
  const steps = Math.max(20, Math.round(totalDuration / 16));
  const bend = (Math.random() - 0.5) * Math.min(120, distance * 0.18);

  for (let step = 1; step <= steps; step += 1) {
    const progress = easeInOut(step / steps);
    const arc = Math.sin(Math.PI * progress) * bend;
    const x = startX + dx * progress - (dy / distance) * arc;
    const y = startY + dy * progress + (dx / distance) * arc;
    await page.mouse.move(x, y);
    await sleep(totalDuration / steps);
  }

  cursorPosition.x = targetX;
  cursorPosition.y = targetY;
}

// 휠을 잘게 나눠 굴리고 끝에서 감속한다. 커서 아래 스크롤 영역(문서/패널/채팅)이 움직인다.
async function smoothScroll(page, deltaY, duration) {
  if (Math.abs(deltaY) < 8) return;
  const totalDuration = duration ?? clamp(700 + Math.abs(deltaY) * 1.5, 700, 2_600);
  const steps = Math.max(16, Math.round(totalDuration / 16));
  let sent = 0;

  for (let step = 1; step <= steps; step += 1) {
    const tick = Math.round(deltaY * easeInOut(step / steps) - sent);
    if (tick !== 0) {
      await page.mouse.wheel(0, tick);
      sent += tick;
    }
    await sleep(totalDuration / steps);
  }
}

// 요소가 화면 가운데(block: "center") 또는 위쪽(block: "start")에 오도록 부드럽게 스크롤하고 멈춘다.
async function scrollToShow(page, locator, { block = "center" } = {}) {
  await locator.waitFor({ state: "attached" });
  const target = await locator.evaluate((element, mode) => {
    const rect = element.getBoundingClientRect();
    const height = window.innerHeight;
    const alreadyComfortable = rect.top >= 80 && rect.bottom <= height - 80;
    let delta = rect.top + rect.height / 2 - height / 2;
    if (mode === "start" || rect.height > height - 160) delta = rect.top - 96;
    else if (alreadyComfortable) delta = 0;
    return { delta, x: rect.left + rect.width / 2 };
  }, block);

  if (Math.abs(target.delta) < 8) return;
  await moveCursor(page, clamp(target.x, 320, viewport.width - 80), viewport.height * 0.58);
  await hold(250);
  await smoothScroll(page, target.delta);
  await hold(300);
}

async function showClick(page) {
  await page.evaluate(() => {
    const cursor = document.getElementById("demo-cursor");
    cursor?.classList.add("demo-cursor-click");
    window.setTimeout(() => cursor?.classList.remove("demo-cursor-click"), 180);
  }).catch(() => {});
}

async function moveAndClick(page, locator, { after = 1_400 } = {}) {
  await locator.waitFor({ state: "visible" });
  await scrollToShow(page, locator);
  const box = await locator.boundingBox();
  if (!box) throw new Error("클릭할 요소의 위치를 찾지 못했습니다.");

  await moveCursor(
    page,
    box.x + box.width * (0.4 + Math.random() * 0.2),
    box.y + box.height * (0.4 + Math.random() * 0.2),
  );
  await hold(450);
  await showClick(page);
  await locator.click();
  await hold(after);
}

async function typeLikeHuman(locator, text) {
  for (const character of text) {
    await locator.pressSequentially(character);
    const pause = /[\s,.?!]/.test(character) ? 140 + Math.random() * 160 : 35 + Math.random() * 55;
    await sleep(pause);
  }
}

async function navigate(page, label, urlPattern) {
  await moveAndClick(page, page.getByRole("link", { name: label, exact: true }), { after: 0 });
  await page.waitForURL(urlPattern);
  await page.waitForLoadState("networkidle");
  await hold(1_600);
}

async function ask(page, question, responseIndex) {
  const prompt = page.getByPlaceholder("문서와 프로젝트에 대해 무엇이든 물어보세요");
  await moveAndClick(page, prompt, { after: 500 });
  await typeLikeHuman(prompt, question);
  await hold(900);
  await moveAndClick(page, page.getByRole("button", { name: "질문 전송" }), { after: 0 });
  await page.getByRole("button", { name: "답변 근거" }).nth(responseIndex).waitFor({
    state: "visible",
    timeout: 180_000,
  });
  // 답변을 읽을 시간.
  await hold(3_500);
}

const files = await demoFiles();
await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext({
  viewport,
  recordVideo: { dir: outputDirectory, size: viewport },
});
await context.addInitScript(() => {
  const mountCursor = () => {
    if (document.getElementById("demo-cursor")) return;
    let start = "translate(1100px,120px)";
    try {
      start = sessionStorage.getItem("demo-cursor") ?? start;
    } catch {}
    const cursor = document.createElement("div");
    cursor.id = "demo-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.style.cssText = `position:fixed;top:0;left:0;z-index:2147483647;width:18px;height:18px;border:2px solid #f97316;border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 2px 10px rgba(0,0,0,.28);pointer-events:none;transform:${start};transition:width .12s,height .12s,margin .12s;`;
    const style = document.createElement("style");
    style.textContent = ".demo-cursor-click{width:10px!important;height:10px!important;margin:4px!important}";
    document.head.append(style);
    document.documentElement.append(cursor);
    document.addEventListener("mousemove", (event) => {
      const transform = `translate(${event.clientX - 9}px,${event.clientY - 9}px)`;
      cursor.style.transform = transform;
      try {
        sessionStorage.setItem("demo-cursor", transform);
      } catch {}
    }, { passive: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountCursor, { once: true });
  else mountCursor();
});
const page = await context.newPage();
const video = page.video();

try {
  await page.goto(`${baseUrl}/upload`, { waitUntil: "networkidle" });
  await hold(1_500);

  // 1. 문서 업로드
  await page.locator('input[type="file"]').setInputFiles(files);
  await page.getByRole("heading", { name: "업로드할 문서를 확인하세요." }).waitFor();
  await hold(2_200);
  await moveAndClick(page, page.getByRole("button", { name: "업로드 시작" }));

  const projectLink = page.getByRole("link", { name: "프로젝트 폴더 보기" });
  await projectLink.waitFor({ state: "visible", timeout: 600_000 });
  await hold(2_500);
  await moveAndClick(page, projectLink, { after: 0 });

  // 2. 프로젝트 폴더: 지식카드 → 카드 상세 → 원본 문서
  const cardsSection = page.locator("#project-cards-title");
  await cardsSection.waitFor();
  await page.waitForLoadState("networkidle");
  await hold(2_000);
  await scrollToShow(page, cardsSection, { block: "start" });
  await hold(2_800);

  await moveAndClick(page, page.locator('article[role="button"]').first(), { after: 0 });
  await page.getByText("지식 상세", { exact: true }).waitFor();
  await hold(2_800);
  await moveCursor(page, detailPanelPoint.x, detailPanelPoint.y);
  await smoothScroll(page, 520);
  await hold(2_800);
  await smoothScroll(page, 520);
  await hold(2_500);
  await moveAndClick(page, page.getByRole("button", { name: "닫기" }));

  await scrollToShow(page, page.locator("#project-documents-title"), { block: "start" });
  await hold(2_500);

  const projectUrl = page.url();
  const originalDocument = page.locator('[aria-label$="원본 열기"]').first();
  const popupPromise = context.waitForEvent("page");
  await moveAndClick(page, originalDocument, { after: 0 });
  const documentPage = await popupPromise;
  await documentPage.waitForURL(/^(?!about:blank$).+/, { timeout: 60_000 });
  const documentUrl = documentPage.url();
  await documentPage.close();

  // shortcut: Playwright records one page at a time, so show the PDF in the recorded tab; use an OS recorder to capture a separate tab.
  await page.goto(documentUrl, { waitUntil: "domcontentloaded" });
  await hold(2_500);
  await moveCursor(page, viewport.width / 2, viewport.height * 0.55);
  await smoothScroll(page, 600).catch(() => {});
  await hold(2_500);
  await page.goto(projectUrl, { waitUntil: "networkidle" });
  await hold(1_500);

  // 3. 지식카드: 전체 카드 → 검색
  await navigate(page, "지식카드", /\/knowledge/);
  await moveAndClick(page, page.getByRole("link", { name: "전체 카드" }), { after: 0 });
  const results = page.locator("#knowledge-results-title");
  await results.waitFor();
  await hold(1_800);
  await scrollToShow(page, results, { block: "start" });
  await hold(2_800);

  const cardSearch = page.getByRole("searchbox", { name: "지식카드 검색" });
  await moveAndClick(page, cardSearch, { after: 500 });
  await typeLikeHuman(cardSearch, "보상");
  await hold(800);
  await moveAndClick(page, page.getByRole("button", { name: "검색", exact: true }), { after: 2_000 });
  await scrollToShow(page, results, { block: "start" });
  await hold(3_000);

  // 4. 챗봇: 질문 → 근거 → 근거 카드 → 후속 질문
  await navigate(page, "챗봇", (url) => new URL(url).pathname === "/");
  await ask(page, firstQuestion, 0);
  await moveAndClick(page, page.getByRole("button", { name: "답변 근거" }).first(), { after: 2_800 });
  const referencedCard = page.getByRole("button", { name: /^지식카드/ }).last();
  await moveAndClick(page, referencedCard, { after: 3_000 });
  await moveAndClick(page, page.getByRole("button", { name: "닫기" }));

  await ask(page, followUpQuestion, 1);
  await moveAndClick(page, page.getByRole("button", { name: "답변 근거" }).last(), { after: 3_500 });
} finally {
  await context.close();
  await browser.close();
}

const outputPath = join(outputDirectory, "job-knowledge-demo.webm");
await video.saveAs(outputPath);
console.log(`시연 영상 저장 완료: ${basename(outputPath)}`);
