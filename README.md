# HRM System

HRM System là giao diện web quản trị nhân sự cho doanh nghiệp vừa, tập trung vào **Full HR Workflow**: quản lý tổ chức, nhân viên, hợp đồng, chấm công, nghỉ phép, thông báo, payroll và phân quyền theo vai trò.

Dự án được xây dựng bằng React + TypeScript + Vite, có routing bằng `react-router-dom` và được phát triển theo hướng **TDD** với Vitest + Testing Library.

## Tính năng đã implement

### Foundation

- Layout chính gồm sidebar, topbar và content workspace.
- Điều hướng theo route với `react-router-dom`.
- Role selector để mô phỏng quyền truy cập.
- RBAC cơ bản theo vai trò:
  - Admin
  - HR
  - Manager
  - Employee
  - Payroll/Finance
- Trang `Access Denied` khi role không đủ quyền.
- CSS đã được tách theo page/component để tránh một file `App.css` quá lớn.

### Dashboard

- Dashboard overview cho HR/Admin.
- Metric cards cho employees, approvals và payroll status.
- Hiring pipeline.
- Pending approvals summary.
- Payroll summary card.
- Phase roadmap từ `REQUIREMENT.md`.

### Organization Management

- Quản lý danh sách phòng ban.
- Thêm phòng ban mới.
- Gán manager cho phòng ban.
- Hiển thị role/job title catalog.
- Summary cards cho departments, job titles và headcount.

### Employee Management

- Danh sách nhân viên.
- Search nhân viên.
- Filter theo department và employment status.
- Empty state khi không có kết quả.
- Thêm nhân viên mới từ form.
- Sinh mã nhân viên tiếp theo dạng `EMP-###`.

### Settings & Master Data

- Quản lý leave types.
- Thêm leave type mới.
- Hiển thị contract types.
- Hiển thị holidays.
- Summary cards cho master data.

### Leave Management

- Trang Leave Management riêng.
- Danh sách leave requests.
- Tạo leave request mới.
- Approve/reject request pending.
- Theo dõi remaining leave balance theo nhân viên.
- Summary pending approvals, approved days và leave types.

### Attendance Management

- Trang Attendance Management riêng.
- Company timesheet table.
- Thêm attendance record mới.
- Theo dõi check-in/check-out theo ngày.
- Trạng thái attendance: On time, Late, Remote, Missing checkout.
- Standard working hours card.

### Contract Management

- Module và route `/contracts`.
- Contract registry.
- Thêm hợp đồng mới cho nhân viên.
- Theo dõi loại hợp đồng, start date, end date và status.
- Status: Active, Expiring soon, Expired.
- Expiry watchlist cho hợp đồng sắp hết hạn.

### Notifications

- Module và route `/notifications`.
- Notification center cho thông báo trong hệ thống.
- Các notification mẫu:
  - Contract expiring soon
  - Onboarding task assigned
  - Leave request approved
- Mark notification as read.
- Summary unread/total alerts.
- Notification trigger list.

### Payroll

- Payroll workspace có bảo vệ quyền truy cập.
- Payroll chỉ hiển thị cho Admin hoặc Payroll/Finance.
- Nội dung cảnh báo dữ liệu lương là dữ liệu nhạy cảm.

## Routes chính

| Route | Mô tả |
|---|---|
| `/dashboard` | Dashboard tổng quan |
| `/organization` | Quản lý phòng ban và role catalog |
| `/employees` | Quản lý danh sách nhân viên |
| `/contracts` | Quản lý hợp đồng lao động |
| `/attendance` | Quản lý chấm công |
| `/leave` | Quản lý nghỉ phép và phê duyệt |
| `/notifications` | Trung tâm thông báo |
| `/payroll` | Payroll workspace có phân quyền |
| `/settings` | Master data và cấu hình cơ bản |
| `/recruitment` | Placeholder workflow module |
| `/onboarding` | Placeholder workflow module |
| `/performance` | Placeholder workflow module |
| `/reports` | Placeholder workflow module |
| `/audit` | Placeholder audit/security module |

## Công nghệ sử dụng

- React 19
- TypeScript
- Vite
- React Router DOM
- Vitest
- Testing Library
- ESLint

## Cài đặt và chạy project

```bash
npm install
npm run dev
```

Sau khi chạy dev server, mở URL Vite hiển thị trong terminal, thường là:

```text
http://localhost:5173
```

## Scripts

| Script | Mục đích |
|---|---|
| `npm run dev` | Chạy development server |
| `npm run build` | Type-check và build production |
| `npm run preview` | Preview production build |
| `npm run lint` | Chạy ESLint |
| `npm test` | Chạy test một lần bằng Vitest |
| `npm run test:watch` | Chạy test ở watch mode |

## Testing strategy

Dự án đang dùng TDD cho các slice chức năng:

1. Viết failing test mô tả user flow.
2. Implement tối thiểu để test xanh.
3. Chạy full verification.

Các test chính nằm tại:

```text
tests/App.test.tsx
tests/StyleArchitecture.test.ts
```

Các luồng đã có test bao gồm:

- Redirect `/` sang dashboard.
- Route navigation và active sidebar link.
- RBAC cho Payroll.
- Employee search/filter/add flow.
- Organization add department flow.
- Settings add leave type flow.
- Leave submit/approve flow.
- Attendance add record flow.
- Contract create flow.
- Notifications mark-as-read flow.
- CSS architecture guard để giữ style theo page/component.

## Cấu trúc thư mục

```text
src/
  components/      Shared UI components
  data/            Mock HRM data, modules, roles, permissions
  pages/           Page-level modules and page-specific CSS
  App.tsx          App shell, routes, RBAC route guard
  App.css          Global/shared styles only

tests/
  App.test.tsx
  StyleArchitecture.test.ts

REQUIREMENT.md     Tổng hợp requirement và roadmap implement
README.md          Tài liệu project
```
