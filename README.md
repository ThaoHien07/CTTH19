# Enterprise BI AI Agent — Cao Thị Thảo Hiền

Nền tảng trợ lý dữ liệu AI (**AI & Human-in-the-Loop**) hỗ trợ tiếp nhận dữ liệu bán lẻ, kiểm tra định dạng, làm sạch minh bạch (**Đỏ → Xanh**), phân tích Insight (`DATA → INFORMATION → INSIGHT → DECISION`), đề xuất Action Plan KPI và xuất báo cáo **Word (`.doc`)**, **PowerPoint (`.pptx`)**, **Excel có kẻ bảng & màu (`.xlsx`)**, **Dashboard (`.html`)**.

## Cấu trúc thư mục
- `public/`: Toàn bộ mã nguồn giao diện web (`index.html`, `presentation.html`, `app.js`, `data.js`, `style.css`), hình ảnh và thư viện xử lý offline (`xlsx-style.bundle.js`, `pptxgen.bundle.js`, `papaparse.min.js`).
- `datasets/`: Bộ dữ liệu CSV mẫu (`PhucAn_DuLieu_Goc_1006Dong.csv`, `PhucAn_DuLieu_Moi_1000Dong.csv`).
- `server.ps1` & `Chay_AI_Agent.bat`: Máy chủ cục bộ chạy trực tiếp trên Windows (`http://localhost:8088/`).
- `vercel.json`: Cấu hình triển khai nhanh lên Vercel khi kết nối GitHub.

## Cách chạy trên máy (Windows)
1. Nhấp đúp vào `Chay_AI_Agent.bat` (hoặc chạy `powershell -ExecutionPolicy Bypass -File server.ps1`).
2. Trình duyệt sẽ mở `http://localhost:8088/`.
3. Mở Slide thuyết trình hướng dẫn sử dụng tại `http://localhost:8088/presentation.html`.

## Cách đẩy lên GitHub
```bash
git remote add origin https://github.com/<ten-tai-khoan>/<ten-repo>.git
git branch -M main
git push -u origin main
```

