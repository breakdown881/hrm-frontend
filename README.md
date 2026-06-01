# HRM System

HRM System là giao diện web quản trị nhân sự cho doanh nghiệp vừa, tập trung vào **Full HR Workflow**: authentication/RBAC, dashboard, organization, employee profiles, contracts, recruitment, onboarding, attendance, leave, approvals, notifications, performance, payroll, reports, settings và audit/security.

Dự án được xây dựng bằng **React + TypeScript + Vite**, routing bằng `react-router-dom`, và được phát triển theo hướng **TDD** với Vitest + Testing Library.

## Tính năng đã implement

### Authentication & Authorization

- Trang `/login` cho đăng nhập mock.
- Đăng xuất từ topbar.
- Đổi mật khẩu mock.
- Quản lý session ở UI state.
- Role selector mô phỏng vai trò hiện tại.
- RBAC theo vai trò:
  - Admin
  - HR
  - Manager
  - Employee
  - Payroll/Finance
- Ẩn navigation item theo quyền.
- Route guard cho module không đủ quyền.
- Trang `Access Denied` hiển thị role và module bị chặn.

### Dashboard

- Dashboard overview cho Admin/HR.
- Metric cards cho headcount, approvals, payroll và hiring.
- Hiring pipeline summary.
- Pending approvals summary.
- Payroll summary card.

### Organization Management

- Quản lý danh sách phòng ban.
- Thêm phòng ban mới.
- Gán manager cho phòng ban.
- Hiển thị job title/role catalog.
- Summary cards cho departments, job titles và headcount.

### Employee Management

- Danh sách nhân viên.
- Search nhân viên theo mã, tên, chức danh, phòng ban, manager.
- Filter theo department và employment status.
- Empty state khi không có kết quả.
- Thêm nhân viên mới.
- Sinh mã nhân viên dạng `EMP-###`.
- Xem chi tiết nhân viên từ directory.
- Sửa thông tin hồ sơ nhân viên.
- Quản lý thông tin cá nhân:
  - Họ tên
  - Ngày sinh
  - Giới tính
  - Email
  - Số điện thoại
  - Địa chỉ
  - Avatar initials
- Quản lý thông tin công việc:
  - Mã nhân viên
  - Phòng ban
  - Chức danh
  - Manager trực tiếp
  - Ngày bắt đầu làm việc
  - Loại nhân viên
  - Trạng thái làm việc
- Quản lý liên hệ khẩn cấp.

### Contract Management

- Route `/contracts`.
- Contract registry.
- Tạo hợp đồng mới cho nhân viên.
- Theo dõi loại hợp đồng, start date, end date và status.
- Status: `Active`, `Expiring soon`, `Expired`.
- Expiry watchlist cho hợp đồng sắp hết hạn.

### Recruitment Management

- Route `/recruitment`.
- Quản lý job openings.
- Tạo job opening mới.
- Quản lý candidate pipeline.
- Tạo candidate mới với thông tin liên hệ, vị trí ứng tuyển, nguồn ứng viên và trạng thái.
- Pipeline stages: Applied, Screening, Interview, Offer, Hired, Rejected.
- Convert hired candidate thành employee record mock.
- Hiển thị danh sách converted employees.

### Onboarding Management

- Route `/onboarding`.
- New hire checklist.
- Tạo onboarding task mới.
- Gán new hire và task owner.
- Mark task as completed.
- Theo dõi trạng thái onboarding task.

### Attendance Management

- Route `/attendance`.
- Company timesheet table.
- Thêm attendance record mới.
- Theo dõi check-in/check-out theo ngày.
- Trạng thái attendance: On time, Late, Remote, Missing checkout.
- Standard working hours card.

### Leave Management

- Route `/leave`.
- Danh sách leave requests.
- Tạo leave request mới.
- Approve/reject pending request.
- Theo dõi remaining leave balance theo nhân viên.
- Summary pending approvals, approved days và leave types.

### Request & Approval Workflow

- Route `/approvals`.
- Pending request queue.
- Approve/reject request với decision note.
- Lưu decision history trong UI state.
- Hỗ trợ leave request và timesheet adjustment mock.

### Notifications

- Route `/notifications`.
- Notification center cho in-system alerts.
- Notification mẫu:
  - Contract expiring soon
  - Onboarding task assigned
  - Leave request approved
- Mark notification as read.
- Summary unread/total alerts.
- Notification trigger list.

### Performance Management

- Route `/performance`.
- Review cycles summary.
- Evaluation history.
- Tạo review record mới.
- Lưu self review score, manager review score và manager comment.
- Tính/hiển thị review data trong bảng.

### Payroll Management

- Route `/payroll`.
- Payroll workspace có bảo vệ quyền truy cập.
- Payroll chỉ hiển thị cho Admin hoặc Payroll/Finance.
- Tạo payroll run theo tháng.
- Tính net pay dựa trên:
  - Basic salary
  - Working days
  - Unpaid leave days
  - Allowances
  - Deductions
- Payslip preview.
- Lock payroll cycle.
- Cảnh báo dữ liệu lương là dữ liệu nhạy cảm.

### Reports & Analytics

- Route `/reports`.
- Report builder.
- Filter theo department/status.
- Generate report preview.
- Export current report mock.
- Các report type cơ bản cho headcount, leave, attendance và payroll overview.

### Settings & Master Data

- Route `/settings`.
- Quản lý leave types.
- Thêm leave type mới.
- Hiển thị contract types.
- Cấu hình working calendar:
  - Workdays
  - Standard working hours
- Quản lý holidays.
- Thêm holiday mới.
- Summary cards cho leave types, contract types và holidays.

### Audit Log & Security

- Route `/audit`.
- Audit log table/list.
- Filter audit logs theo module.
- Security controls summary.
- Record sensitive action mock.
- Nhấn mạnh kiểm soát truy cập với payroll/contracts/employees.

## Routes chính

| Route | Mô tả | Quyền truy cập mock |
|---|---|---|
| `/` | Redirect sang dashboard | Authenticated |
| `/login` | Authentication | Public |
| `/dashboard` | Dashboard tổng quan | Admin, HR, Manager, Employee, Payroll/Finance |
| `/organization` | Quản lý phòng ban, job titles, managers | Admin, HR |
| `/employees` | Quản lý danh sách và hồ sơ nhân viên | Admin, HR, Manager, Payroll/Finance |
| `/contracts` | Quản lý hợp đồng lao động | Admin, HR |
| `/recruitment` | Job openings, candidates, hired-to-employee conversion | Admin, HR, Manager |
| `/onboarding` | New hire checklist và task owner | Admin, HR, Manager |
| `/attendance` | Timesheet và attendance records | Admin, HR, Manager, Employee, Payroll/Finance |
| `/leave` | Leave requests, balances, approve/reject | Admin, HR, Manager, Employee, Payroll/Finance |
| `/notifications` | Notification center | Admin, HR, Manager, Employee, Payroll/Finance |
| `/approvals` | Central approval queue | Admin, HR, Manager |
| `/performance` | Review cycles và evaluations | Admin, HR, Manager, Employee |
| `/payroll` | Payroll runs, payslip, lock cycle | Admin, Payroll/Finance |
| `/reports` | Reports & analytics | Admin, HR, Manager, Payroll/Finance |
| `/settings` | Master data và working calendar | Admin, HR |
| `/audit` | Audit log & security controls | Admin |

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
2. Chạy test để xác nhận trạng thái đỏ.
3. Implement tối thiểu để test xanh.
4. Chạy targeted test.
5. Chạy full verification: test, lint, build.

Các test chính nằm tại:

```text
tests/App.test.tsx
tests/StyleArchitecture.test.ts
```

## Cấu trúc thư mục

```text
src/
  components/      Shared UI components và component-specific CSS
  data/            Mock HRM data, modules, roles, permissions
  pages/           Page-level modules và page-specific CSS
  App.tsx          App shell, routes, session state, RBAC route guard
  App.css          Global/shared styles only

tests/
  App.test.tsx
  StyleArchitecture.test.ts

REQUIREMENT.md     Tổng hợp requirement và roadmap implement
README.md          Tài liệu project
```
