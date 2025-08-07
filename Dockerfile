# Build Stage
FROM node:18-alpine AS builder

# Đặt thư mục làm việc
WORKDIR /app/frontend

# Sao chép các file package.json và package-lock.json của frontend
COPY frontend/package*.json ./

# Cài đặt các gói dependency của frontend
RUN npm install

# Sao chép các file nguồn của frontend
COPY frontend/. .

# Xây dựng ứng dụng để tạo ra các file tĩnh
RUN npm run build

# Stage 2: Serve ứng dụng
FROM node:18-alpine

# Cài đặt PM2
RUN npm install pm2 -g

# Đặt thư mục làm việc cho backend
WORKDIR /app/backend

# Sao chép các file package.json và package-lock.json của backend
COPY backend/package*.json ./

# Cài đặt các gói dependency của backend
RUN npm install

# Sao chép các file nguồn của backend
COPY backend/. .

# Sao chép các file đã build từ builder stage
COPY --from=builder /app/frontend/build /app/frontend/build

# Mở cổng 4000
EXPOSE 8002

# Khởi chạy ứng dụng bằng PM2
CMD [ "pm2-runtime", "server.js" ]
