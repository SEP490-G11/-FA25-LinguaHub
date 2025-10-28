// import { useDispatch, useSelector } from 'react-redux';
// import { RootState, AppDispatch } from '@/store';
// import { signIn } from '@/pages/auth/signin';
// import { useEffect } from 'react';
//
// /**
//  * Custom hook quản lý xác thực người dùng
//  */
// export function useAuth() {
//   const dispatch = useDispatch<AppDispatch>();
//   const { user, isAuthenticated, isLoading, error } = useSelector(
//       (state: RootState) => state.auth
//   );
//
//   // Khi app khởi động -> load lại thông tin user
//   useEffect(() => {
//     dispatch(loadUserFromStorage());
//   }, [dispatch]);
//
//   // Đăng nhập
//   const login = async (username: string, password: string, rememberMe?: boolean) => {
//     await dispatch(signIn({ username, password, rememberMe }));
//   };
//
//   // Đăng xuất
//   const logout = async () => {
//     await dispatch(signOut());
//   };
//
//   // Kiểm tra trạng thái đăng nhập
//   const verifyAuth = async () => {
//     await dispatch(checkAuth());
//   };
//
//   return {
//     user,
//     isAuthenticated,
//     isLoading,
//     error,
//     login,
//     logout,
//     verifyAuth,
//   };
// }
