## Sử dụng

- \*\*React
- **Vite**
- \*\*Tailwindcss
- **shadcn/ui** (dựa trên Radix UI): Bộ component UI chính của dự án
- **Redux Toolkit** và **React Redux**: Quản lý state tập trung
- **TanStack React Query**: Quản lý gọi API và cache dữ liệu
- **React Router v6**: Định tuyến và chuyển trang
- **Zod** cùng **react-hook-form**: Xác thực và kiểm soát form
- **Axios**

- Node.js >= 18
- npm >= 9 (hoặc dùng pnpm/yarn, tùy chọn)
Mở dự án tại port `http://localhost:3000`
- Thêm CORS ở BE để cho phép FE truy cập
---

## Cấu trúc thư mục

```
src/ 
  api/               Layer giao tiếp với backend (Axios)
  assets/            Layer chứa hình ảnh, biểu tượng,...
  components/        Layer chứa các UI components tái sử dụng
  constants/         Layer file chứa các hằng số
  pages/             Layer chứa các màn hình chính
  routes/            Layer định tuyến (React Router)
  store/             Layer quản lý state
  types/             Layer định nghĩa TypeScript types / interfaces
  utils/             Layer chứa hàm tiện ích 
```
```
Ngôn ngữ chính:
 TypeScript - Ngôn ngữ lập trình chính với type safety
 TSX/JSX - Cú pháp cho React components
 CSS - Styling với Tailwind CSS

```
