## 챗봇 연결

기본값은 기존 프론트 데모(`mock`)입니다. `.env.local`에 아래 값을 설정하고 개발 서버를 재시작하면 API 모드로 전환합니다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_CHAT_MODE=api
```

`mock`으로 되돌리면 기존 답변·참조 카드 데모를 그대로 사용합니다. API 오류 시 목데이터로 자동 전환하지 않습니다.
`NEXT_PUBLIC_` 설정은 빌드 시 고정되므로 배포에서는 다시 빌드해야 합니다. Docker Compose의 프론트 `build.args`에도 `NEXT_PUBLIC_CHAT_MODE: api`를 지정하세요.

백엔드와 맞출 규격:

- `POST /api/chat/stream`, 요청: `{ "message": "현재 질문", "history": [{ "role": "user", "content": "이전 질문" }, { "role": "assistant", "content": "이전 답변" }] }`
- 현재 질문은 `history`에 중복해서 넣지 않습니다. 실패한 답변은 제외합니다.
- 응답 `Content-Type: text/event-stream`, 각 이벤트는 빈 줄로 구분합니다.
- `event: token` → `data: {"content":"추가할 답변 조각"}` (누적 답변이 아닌 delta)
- `event: references` → `data: {"items":[...]}` (`src/features/chat/types.ts`의 `ChatReference[]`, 전체 카드 포함, 근거 없으면 빈 배열)
- `event: completed` → `data: {}` (필수 종료 이벤트)
- `event: error` → `data: {"message":"오류 설명"}`

현재 백엔드의 `/api/chat/stream`도 Mock이므로 API 연결 성공과 실제 RAG 완성은 별개입니다.
프론트 SSE 처리 및 오류·취소 검증: `node --test src/features/chat/api.test.mjs`.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
