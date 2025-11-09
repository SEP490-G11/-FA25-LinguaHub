# Token Authentication Debug Guide

## 🔐 Kiểm tra Token trong LocalStorage

### 1. Mở Browser DevTools
Press `F12` → **Application** tab → **Storage** → **Local Storage** → `http://localhost:3002`

### 2. Tìm key `access_token`
- ✅ Nếu có: Bạn đã đăng nhập
- ❌ Nếu không có: Cần đăng nhập lại

### 3. Kiểm tra Console khi gọi API
Khi nhấn "Tiếp theo", console sẽ hiển thị:

```
🔧 Axios Interceptor:
  URL: http://localhost:8080/tutor/courses
  Token found: true
  ✅ Authorization header added

🔐 Token exists: true
🔐 Token preview: eyJhbGciOiJIUzI1NiIs...
📤 API Request: POST /tutor/courses
```

---

## 🐛 Troubleshooting 401 Unauthorized

### ❌ Problem 1: Token không tồn tại
**Console shows:**
```
⚠️ No token found in localStorage!
🔐 Token exists: false
🔐 Token preview: NO TOKEN
```

**Solution:**
1. Đăng nhập lại tại `/login`
2. Sau khi login thành công, token sẽ được lưu vào `localStorage`
3. Kiểm tra lại bằng: `localStorage.getItem('access_token')`

---

### ❌ Problem 2: Token hết hạn
**Console shows:**
```
✅ Authorization header added
❌ API Error: { message: "Token expired" }
❌ Status: 401
```

**Solution:**
1. Logout: `localStorage.removeItem('access_token')`
2. Login lại để lấy token mới

---

### ❌ Problem 3: Token key sai
**Check localStorage keys:**
```javascript
// In console:
Object.keys(localStorage)
// Should include: "access_token"
```

**If you see different key (e.g., "accessToken"):**
```javascript
// Rename it:
const token = localStorage.getItem('accessToken');
localStorage.setItem('access_token', token);
localStorage.removeItem('accessToken');
```

---

### ❌ Problem 4: Wrong token format
**Token should start with:** `eyJ...` (JWT format)

**Check in console:**
```javascript
const token = localStorage.getItem('access_token');
console.log('Token:', token);
console.log('Is JWT:', token?.startsWith('eyJ'));
```

---

## 🔍 Manual Check Script

Copy-paste vào Console để kiểm tra:

```javascript
// Check token
const token = localStorage.getItem('access_token');
console.log('=== TOKEN CHECK ===');
console.log('Exists:', !!token);
console.log('Length:', token?.length);
console.log('Format:', token?.substring(0, 20) + '...');
console.log('Is JWT:', token?.startsWith('eyJ'));

// Decode JWT (basic check)
if (token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    console.log('Decoded payload:', payload);
    console.log('Expires:', new Date(payload.exp * 1000));
    console.log('Is expired:', Date.now() > payload.exp * 1000);
  } catch (e) {
    console.error('Invalid JWT format');
  }
}
```

---

## ✅ Expected Flow

### 1. User Login
```
POST /auth/login
Response: { access_token: "eyJ..." }
→ localStorage.setItem('access_token', token)
```

### 2. Create Course (with token)
```
POST /tutor/courses
Headers: { Authorization: "Bearer eyJ..." }
→ 200 OK (if authenticated)
→ 401 Unauthorized (if not authenticated)
```

---

## 🔧 Test Token Manually

### Option 1: Using Postman/Thunder Client
```
POST http://localhost:8080/tutor/courses
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN_HERE
Body:
{
  "title": "Test Course",
  "description": "Test",
  "categoryID": 2,
  "language": "English",
  "duration": 30,
  "price": 1000000,
  "thumbnailURL": ""
}
```

### Option 2: Using curl
```bash
curl -X POST http://localhost:8080/tutor/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Test Course",
    "description": "Test",
    "categoryID": 2,
    "language": "English",
    "duration": 30,
    "price": 1000000
  }'
```

---

## 📝 Quick Fixes

### Fix 1: Force re-login
```javascript
// In console:
localStorage.clear();
window.location.href = '/login';
```

### Fix 2: Copy token from another tab
```javascript
// From working tab:
console.log(localStorage.getItem('access_token'));

// To new tab:
localStorage.setItem('access_token', 'PASTE_TOKEN_HERE');
```

### Fix 3: Check if you're on the right role
```javascript
// Check if user is tutor
const token = localStorage.getItem('access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Role:', payload.role); // Should be "TUTOR"
```

---

## 🎯 Summary

| Issue | Console Log | Solution |
|-------|-------------|----------|
| No token | `⚠️ No token found` | Login again |
| Token expired | `401 Unauthorized` | Logout & login |
| Wrong key | Token found: false | Rename localStorage key |
| Invalid format | Not starting with `eyJ` | Get new token |

---

Updated: 2025-01-09
