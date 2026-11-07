## 지식 라이브러리

`/knowledge`에서 프로젝트별 폴더와 전체 카드를 전환합니다. 기존 `/projects` 목록 주소는
`/knowledge`로 연결되며, `/projects/{id}` 상세 주소는 유지합니다.

프로젝트 목록 API는 `GET /api/projects?q=&sort=created&page=1&pageSize=12`이며
`{ items, total }`을 반환합니다. `q`는 프로젝트 이름 검색, `sort`는 `created` 또는 `name`입니다.
검색·정렬은 서버에서 처리하고, 폴더의 카드 개수는 공개된 `active` 카드 기준입니다.
프론트 배포 전에 이 규격을 지원하는 백엔드를 먼저 배포해야 합니다.

## 챗봇 연결

챗봇은 항상 백엔드 API를 호출합니다. 로컬 개발에서는 `.env.local`에 주소를 설정합니다.

```dotenv
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

`NEXT_PUBLIC_` 설정은 빌드 시 고정되므로 배포에서는 다시 빌드해야 합니다. Docker에서는 백엔드 레포 `docker-compose.yml`의 프론트 `build.args`가 이 값을 넘깁니다.

백엔드와 맞출 규격:

- `POST /api/chat/stream`, 요청: `{ "message": "현재 질문", "history": [{ "role": "user", "content": "이전 질문" }, { "role": "assistant", "content": "이전 답변" }] }`
- 현재 질문은 `history`에 중복해서 넣지 않습니다. 실패한 답변은 제외합니다.
- 응답 `Content-Type: text/event-stream`, 각 이벤트는 빈 줄로 구분합니다.
- `event: token` → `data: {"content":"추가할 답변 조각"}` (누적 답변이 아닌 delta)
- `event: references` → `data: {"items":[...],"sources":[...]}` (`src/features/chat/types.ts`의 `ChatReference[]`, `ChatSource[]`, 근거 없으면 빈 배열)
- `event: completed` → `data: {"messageId":"..."}` (필수 종료 이벤트)
- `event: error` → `data: {"message":"오류 설명"}`

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
