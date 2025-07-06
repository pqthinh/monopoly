# frontend/Dockerfile

# Giai đoạn 1: Build ứng dụng React
FROM node:18-alpine as builder

WORKDIR /app/frontend

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ source code của frontend
COPY . .

# Build ứng dụng React ra các file tĩnh
RUN npm run build

# Giai đoạn 2: Serve ứng dụng bằng Nginx
FROM nginx:stable-alpine

# Sao chép các file đã build từ giai đoạn 'builder' vào thư mục public của Nginx
COPY --from=builder /app/frontend/build /usr/share/nginx/html

# Mở cổng 80
EXPOSE 8002

# Lệnh để khởi chạy Nginx
CMD ["nginx", "-g", "daemon off;"]