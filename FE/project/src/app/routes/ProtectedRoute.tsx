import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store.ts';
import { ROUTES } from '@/shared/constants/routes.ts';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'Tutor' | 'Admin' | 'Learner'; // Role cần thiết để truy cập
  requireAuth?: boolean; // Yêu cầu đăng nhập
}

/**
 * ProtectedRoute - Bảo vệ trang dựa trên role và authentication
 * 
 * @example
 * <Route 
 *   path="/tutor/*" 
 *   element={<ProtectedRoute requiredRole="Tutor"><TutorPages /></ProtectedRoute>} 
 * />
 */
export function ProtectedRoute({ 
  children, 
  requiredRole = undefined,
  requireAuth = true 
}: ProtectedRouteProps) {
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // ✅ Kiểm tra xem có đăng nhập không
  if (requireAuth && !isAuthenticated) {
    console.warn('[ProtectedRoute] ❌ Chưa đăng nhập - Redirect to Sign In');
    return <Navigate to={ROUTES.SIGN_IN} replace />;
  }

  // ✅ Kiểm tra xem có role phù hợp không
  if (requiredRole && user?.role !== requiredRole) {
    console.warn(`[ProtectedRoute] ❌ Role không khớp - User role: ${user?.role}, Required: ${requiredRole}`);
    // Redirect dựa trên role
    if (user?.role === 'Tutor') {
      return <Navigate to={ROUTES.TUTOR_DASHBOARD} replace />;
    }
    return <Navigate to={ROUTES.HOME} replace />;
  }

  // ✅ Nếu pass hết các kiểm tra, hiển thị component
  console.log(`[ProtectedRoute] ✅ Truy cập được phép - User: ${user?.fullName} (${user?.role})`);
  return <>{children}</>;
}
