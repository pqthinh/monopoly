# Giai đoạn 1: Build ứng dụng React
# Sử dụng một image Node.js phiên bản 18-alpine làm image cơ sở.
FROM node:18-alpine

# Đặt thư mục làm việc mặc định trong container là /app/frontend.
WORKDIR /app/frontend

# Sao chép các file package.json và package-lock.json vào thư mục làm việc.
COPY package*.json ./

# Cài đặt tất cả các dependencies được định nghĩa trong package.json.
RUN npm install

# Sao chép toàn bộ mã nguồn còn lại của frontend vào thư mục làm việc.
COPY . .

# Chạy lệnh build của React để tạo ra các file tĩnh tối ưu cho production.
# Kết quả sẽ được lưu trong thư mục /app/frontend/build.
RUN npm run build

# Cài đặt 'serve' - một máy chủ file tĩnh cho Node.js.
# Cờ -g cài đặt nó trên toàn cục bên trong container.
RUN npm install -g serve

# Mở cổng 8002 bên trong container.
EXPOSE 8002

# Lệnh mặc định để khởi chạy máy chủ trên cổng 8002.
# 'serve -s build' sẽ phục vụ các file trong thư mục 'build'.
# Cờ '-s' rất quan trọng, nó giúp ứng dụng Single-Page App (SPA) hoạt động đúng
# bằng cách chuyển hướng tất cả các request không tìm thấy về index.html.
# Cờ '-l 8002' chỉ định máy chủ lắng nghe trên cổng 8002.
CMD ["serve", "-s", "build", "-l", "8002"]
