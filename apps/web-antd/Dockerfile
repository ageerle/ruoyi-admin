# 构建阶段
FROM node:22-alpine AS builder

# 接收后端 API 地址（docker-compose 传入）
ARG VITE_GLOB_API_URL=http://localhost:6039
ENV VITE_GLOB_API_URL=${VITE_GLOB_API_URL}

# 设置环境变量
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS=--max-old-space-size=8192
ENV TZ=Asia/Shanghai

# 安装 pnpm
RUN npm i -g corepack && corepack enable

# 设置工作目录
WORKDIR /app

# 复制整个项目（pnpm workspace 需要）
COPY . /app

# 安装依赖（使用 workspace）
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# 先构建所有 workspace 依赖包
RUN pnpm run build
# 构建 web-antd 应用（需要明确指定 build:prod）
RUN pnpm --filter @vben/web-antd run build:prod
# 进入 web-antd 目录
WORKDIR /app/apps/web-antd

# 生产阶段 - 使用 nginx 部署
FROM nginx:stable-alpine AS production

# 配置 nginx 支持 mjs
RUN echo "types { application/javascript js mjs; }" > /etc/nginx/conf.d/mjs.conf \
    && rm -rf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# 复制 nginx 配置文件
COPY apps/web-antd/nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 5666

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
