# 构建阶段
FROM node:22-alpine AS builder

# 接收后端 API 地址（docker-compose 传入）
ARG VITE_GLOB_API_URL=http://localhost:6039
ENV VITE_GLOB_API_URL=${VITE_GLOB_API_URL}

# 设置环境变量 - 优化资源使用，增加内存限制
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS=--max-old-space-size=16384

# 安装 pnpm 和设置时区
RUN npm i -g corepack && corepack enable && \
    apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 设置工作目录
WORKDIR /app

# 先复制 package 文件（优化 Docker 缓存）
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json .npmrc ./

# 复制 internal 目录（包含 @vben/vite-config, @vben/tsconfig 等）
COPY internal ./internal

# 复制 scripts 目录（turbo 依赖）
COPY scripts ./scripts

# 复制 packages 目录（workspace 依赖）
COPY packages ./packages

# 复制 web-antd 应用
COPY apps/web-antd ./apps/web-antd

# 安装依赖（使用 workspace）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 构建 workspace 依赖包（使用 turbo）
RUN pnpm run build --filter="./packages/**"

# 构建 web-antd 应用（直接构建，避免 turbo 过滤器问题）
WORKDIR /app/apps/web-antd
RUN pnpm run build:prod
WORKDIR /app

# 生产阶段 - 使用 nginx 部署
FROM nginx:stable-alpine AS production

# 安装 tzdata 并设置时区
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo "Asia/Shanghai" > /etc/timezone

# 配置 nginx 支持 mjs
RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf \
    && rm -rf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# 复制 nginx 配置文件模板
COPY apps/web-antd/nginx.conf /etc/nginx/nginx.conf.template

# 复制启动脚本
COPY apps/web-antd/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 5666

# 设置默认后端地址（可被 docker-compose environment 覆盖）
ENV UPSTREAM_HOST=127.0.0.1:6039

# 启动脚本（处理环境变量并启动 nginx）
CMD ["/docker-entrypoint.sh"]
