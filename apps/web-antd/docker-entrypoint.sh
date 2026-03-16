#!/bin/sh
# Nginx 启动脚本 - 支持运行时环境变量

# 使用 envsubst 替换 nginx.conf 中的环境变量
envsubst '${UPSTREAM_HOST}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 启动 nginx
exec nginx -g 'daemon off;'
