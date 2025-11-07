# 🎯 Hướng dẫn Role-Based Dashboard Redirect

## ✅ ĐÃ THỰC HIỆN

### 1. **Cập nhật Auth System**
- ✅ `auth/helpers.ts`: Lấy role từ `user_data` (localStorage)
- ✅ `auth/types.ts`: Cập nhật UserRole khớp backend (`Admin` | `Tutor` | `Learner`)
- ✅ Hỗ trợ cả `user_data` (backend format) và `user` (fallback)

### 2. **Role-Based Redirect sau Login**
File: `pages/auth/signin/signin.tsx`

```typescript
const onSubmit = async (data: SignInForm) => {
  await dispatch(signIn(data)).unwrap();
  
  const role = getUserRole();
  
  switch(role) {
    case 'Tutor':
      navigate('/tutor/dashboard', { replace: true });
      break;
    case 'Admin':
      navigate('/admin/dashboard', { replace: true });
      break;
    case 'Learner':
    default:
      navigate(ROUTES.HOME, { replace: true });
      break;
  }
};
```

### 3. **Tạo Dashboard Pages**
- ✅ `pages/TutorDashboard/index.tsx` - Dashboard cho Tutor
- ✅ `pages/AdminDashboard/index.tsx` - Dashboard cho Admin

**Features:**
- Stats cards (Courses, Students, Earnings, etc.)
- Quick actions (Create course, Manage students, etc.)
- Recent activity
- Getting started guide
- Protected với `useRole()` hook

### 4. **Cập nhật Routes**
File: `routes/AppRoutes.tsx`

```typescript
{/* Dashboard Routes */}
<Route path="/tutor/dashboard" element={
  <ProtectedRoute allowedRoles={['Tutor']}>
    <TutorDashboard />
  </ProtectedRoute>
} />

<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['Admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

### 5. **Constants Updates**
- ✅ `constants/routes.ts`: Thêm `TUTOR_DASHBOARD`, `ADMIN_DASHBOARD`
- ✅ `constants/roles.ts`: Cập nhật roles khớp backend

---

## 📊 Flow Hoạt Động

```
1. User đăng nhập
   ↓
2. Backend trả về JWT + User data
   ↓
3. authSlice lưu user_data vào localStorage
   ↓
4. getUserRole() đọc role từ user_data
   ↓
5. Switch-case redirect:
   - Tutor → /tutor/dashboard
   - Admin → /admin/dashboard
   - Learner → / (homepage)
   ↓
6. ProtectedRoute check role
   ↓
7. Hiển thị dashboard tương ứng
```

---

## 🔐 Bảo Mật

### **2 Lớp Protection:**

1. **Route Level** - `ProtectedRoute` component
```typescript
<Route path="/tutor/dashboard" element={
  <ProtectedRoute allowedRoles={['Tutor']}>
    <TutorDashboard />
  </ProtectedRoute>
} />
```

2. **Component Level** - `useRole()` hook
```typescript
export default function TutorDashboard() {
  const { isAuthorized } = useRole(['Tutor']);
  if (!isAuthorized) return null; // Auto redirect
  
  return <div>Dashboard content</div>;
}
```

---

## 🧪 Testing

### **Test Case 1: Tutor Login**
1. Login với account role = `Tutor`
2. ✅ Redirect to `/tutor/dashboard`
3. ✅ Hiển thị Tutor Dashboard với stats
4. ✅ Quick actions: Create Course, Manage Students, etc.

### **Test Case 2: Admin Login**
1. Login với account role = `Admin`
2. ✅ Redirect to `/admin/dashboard`
3. ✅ Hiển thị Admin Dashboard
4. ✅ Quick actions: Review Courses, Approve Tutors, etc.

### **Test Case 3: Learner Login**
1. Login với account role = `Learner`
2. ✅ Redirect to `/` (homepage)
3. ✅ Không truy cập được `/tutor/dashboard` (auto redirect)
4. ✅ Không truy cập được `/admin/dashboard` (auto redirect)

### **Test Case 4: Direct URL Access**
1. Chưa login, access `/tutor/dashboard`
2. ✅ Redirect to `/signin`

3. Login as Learner, access `/tutor/dashboard`
4. ✅ Redirect to `/` (unauthorized)

---

## 📝 Backend Requirements

Backend cần trả về user data với format:

```json
{
  "userID": "123",
  "username": "john_tutor",
  "email": "john@example.com",
  "role": "Tutor",  // ← "Admin" | "Tutor" | "Learner"
  "fullName": "John Smith",
  "avatarURL": "https://...",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Lưu trong localStorage key:** `user_data`

---

## 🎨 Dashboard Features

### **Tutor Dashboard:**
- 📊 Stats: Courses, Students, Sessions, Earnings
- ⚡ Quick Actions: Create Course, Manage Students, Schedule
- 📈 Recent Activity
- 🚀 Getting Started Guide

### **Admin Dashboard:**
- 📊 Stats: Users, Courses, Pending Approvals, Active Tutors
- ⚡ Quick Actions: Review Courses, Approve Tutors, Manage Users
- 📈 Recent Activity
- 📊 Platform Overview

---

## 🔧 Troubleshooting

### **Vấn đề: Redirect không đúng role**
**Nguyên nhân:** localStorage không có `user_data`

**Giải pháp:**
1. Check console: `localStorage.getItem('user_data')`
2. Verify backend response lưu đúng key
3. Check `authSlice.ts` line ~150: `localStorage.setItem('user_data', JSON.stringify(user))`

### **Vấn đề: Role luôn null**
**Nguyên nhân:** Backend trả về role khác format

**Giải pháp:**
1. Check backend response: `console.log(userResponse.result)`
2. Verify role field: `"Admin"` not `"ADMIN"` hay `"admin"`
3. Update `auth/types.ts` nếu cần

### **Vấn đề: Không vào được dashboard**
**Nguyên nhân:** Token hết hạn hoặc không có

**Giải pháp:**
1. Check: `localStorage.getItem('access_token')`
2. Verify `isAuthenticated()` return true
3. Re-login nếu cần

---

## 📚 Files Changed

```
FE/project/src/
├── auth/
│   ├── helpers.ts           ← Updated: getUser() hỗ trợ user_data
│   └── types.ts             ← Updated: UserRole = 'Admin'|'Tutor'|'Learner'
├── pages/
│   ├── auth/signin/
│   │   └── signin.tsx       ← Updated: Role-based redirect
│   ├── TutorDashboard/
│   │   └── index.tsx        ← NEW: Tutor dashboard
│   └── AdminDashboard/
│       └── index.tsx        ← NEW: Admin dashboard
├── routes/
│   └── AppRoutes.tsx        ← Updated: Added dashboard routes
└── constants/
    ├── routes.ts            ← Updated: Added dashboard constants
    └── roles.ts             ← Updated: Roles khớp backend
```

---

## ✅ Checklist Hoàn Thành

- [x] Auth helpers lấy role từ localStorage
- [x] SignIn redirect theo role
- [x] Tạo Tutor Dashboard với UI đẹp
- [x] Tạo Admin Dashboard với UI đẹp
- [x] Thêm dashboard routes protected
- [x] Cập nhật constants (routes, roles)
- [x] Double protection (route + component level)
- [x] Test cases documented
- [x] No compilation errors

---

## 🚀 Next Steps

1. **Kết nối Backend:**
   - Test với real API endpoints
   - Verify response format
   - Handle errors

2. **Enhance Dashboards:**
   - Fetch real stats từ backend
   - Add charts/graphs
   - Recent activity từ API

3. **Add Features:**
   - Schedule management
   - Student list
   - Earnings tracking
   - Analytics

4. **UX Improvements:**
   - Loading states
   - Error boundaries
   - Skeleton screens
   - Toast notifications
