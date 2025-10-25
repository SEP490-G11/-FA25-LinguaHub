import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';  // ✅ Thêm useNavigate để redirect sau logout
import { Bell, Menu, Languages, Heart, User, LogOut, BookOpen, Settings, GraduationCap, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { signOut } from '@/redux/slices/authSlice'; // ✅ Giữ nguyên, giờ là thunk async

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();  // ✅ Thêm để redirect
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();  // ✅ Dispatch thunk async và await để handle redirect
      console.log('✅ Logout success');
      navigate(ROUTES.SIGN_IN, { replace: true });  // Redirect về sign-in
    } catch (err) {
      console.error('❌ Logout error:', err);
      // Optional: navigate anyway nếu error
      navigate(ROUTES.SIGN_IN, { replace: true });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const mockNotifications = [
    {
      id: '1',
      title: 'Khóa học mới',
      message: 'Khóa học tiếng Anh mới đã được thêm vào hệ thống',
      time: '5 phút trước',
      read: false,
    },
    {
      id: '2',
      title: 'Bài học đã hoàn thành',
      message: 'Bạn đã hoàn thành bài học "Basic Grammar"',
      time: '1 giờ trước',
      read: false,
    },
    {
      id: '3',
      title: 'Tin nhắn mới',
      message: 'Giáo viên của bạn đã gửi tin nhắn',
      time: '2 giờ trước',
      read: true,
    },
  ];


  const getUserInitials = () => {
    if (!user?.FullName) return 'U';
    return user.FullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
      <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="w-full px-8 lg:px-16">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to={ROUTES.HOME} className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  Lingua<span className="text-primary">Hub</span>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link
                  to={ROUTES.HOME}
                  className={cn(
                      "transition-colors font-medium",
                      isActive(ROUTES.HOME) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )}
              >
                Home
              </Link>
              <Link
                  to={ROUTES.LANGUAGES}
                  className={cn(
                      "transition-colors font-medium",
                      isActive(ROUTES.LANGUAGES) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )}
              >
                Languages
              </Link>
              <Link
                  to={ROUTES.TUTORS}
                  className={cn(
                      "transition-colors font-medium",
                      isActive(ROUTES.TUTORS) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )}
              >
                Tutors
              </Link>
              <Link
                  to={ROUTES.BECOME_TUTOR}
                  className={cn(
                      "transition-colors font-medium",
                      isActive(ROUTES.BECOME_TUTOR) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                  )}
              >
                Become a Tutor
              </Link>
            </nav>

            {/* Policy Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-4 text-sm">
              <Link
                  to={ROUTES.POLICY}
                  className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                Privacy & Terms
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link to={ROUTES.WISHLIST}>
                  <Heart className="w-5 h-5" />
                </Link>
              </Button>

              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {mockNotifications.some(n => !n.read) && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Thông báo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-y-auto">
                    {mockNotifications.map((notification) => (
                        <DropdownMenuItem
                            key={notification.id}
                            className="flex flex-col items-start p-3 cursor-pointer"
                        >
                          <div className="flex items-start justify-between w-full">
                            <div className="flex-1">
                              <p className={cn(
                                  "text-sm font-medium",
                                  !notification.read && "text-primary"
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                            )}
                          </div>
                        </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {!isAuthenticated ? (
                  <>
                    <Button variant="ghost" asChild>
                      <Link to={ROUTES.SIGN_IN}>Sign In</Link>
                    </Button>
                    <Button asChild>
                      <Link to={ROUTES.SIGN_UP}>Sign Up</Link>
                    </Button>
                  </>
              ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user?.AvatarURL || undefined} alt={user?.FullName || 'User'} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getUserInitials()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user?.FullName || 'User'}</p> {/* ✅ Sửa: Dùng fullName */}
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.Email || 'user@example.com'}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="cursor-pointer"> {/* ✅ Sửa: Hardcode paths vì ROUTES chưa có */}
                          <User className="mr-2 h-4 w-4" />
                          <span>Hồ sơ</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/my-courses" className="cursor-pointer"> {/* ✅ Sửa: Hardcode paths vì ROUTES chưa có */}
                          <BookOpen className="mr-2 h-4 w-4" />
                          <span>Khóa học của tôi</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/my-enrollments" className="cursor-pointer"> {/* ✅ Sửa: Hardcode paths vì ROUTES chưa có */}
                          <GraduationCap className="mr-2 h-4 w-4" />
                          <span>Tiến độ học</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/payment-history" className="cursor-pointer"> {/* ✅ Sửa: Hardcode paths vì ROUTES chưa có */}
                          <CreditCard className="mr-2 h-4 w-4" />
                          <span>Lịch sử thanh toán</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="cursor-pointer"> {/* ✅ Sửa: Hardcode paths vì ROUTES chưa có */}
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Cài đặt</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
  );
};

export default Header;