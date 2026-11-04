# 백엔드 레포의 docker-compose.yml이 이 레포를 GitHub에서 직접 빌드한다.
FROM node:24.21.0-slim

WORKDIR /app

# 의존성 설치를 소스 복사보다 먼저 해서 코드만 바뀌면 설치 단계는 빌드 캐시를 쓴다
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_ 값은 빌드할 때 코드에 박히므로 npm run build보다 앞에 둔다.
# 브라우저로 전달되는 값이라 서버 전용 키를 넣으면 안 된다
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_CHAT_MODE=mock
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
