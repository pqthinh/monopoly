# backend/Dockerfile

# Sử dụng một image Node.js gọn nhẹ
FROM node:18-alpine

# Tạo thư mục làm việc trong container
WORKDIR /app/backend

# Sao chép package.json và package-lock.json vào thư mục làm việc
COPY package*.json ./

# Cài đặt các dependencies
RUN npm install

# Sao chép toàn bộ source code của backend vào
COPY . .

# Mở cổng 4000 để nhận kết nối từ bên ngoài
EXPOSE 4000

# Lệnh để khởi chạy ứng dụng khi container bắt đầu
CMD [ "node", "server.js" ]