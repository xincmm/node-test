# 使用官方 Node.js 镜像
FROM node:22

# 设置工作目录
WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm
RUN npm install

# 复制应用代码
COPY . .

# 暴露 Express 默认端口（通常是 3000）
EXPOSE 3001

# 启动命令
CMD ["pnpm", "start"]
