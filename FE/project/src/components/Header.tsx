import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Menu, X, Languages, Heart, User, LogOut,
  BookOpen, Settings, GraduationCap, CreditCard, Lock, LayoutDashboard
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import api from "@/config/axiosConfig";
import { useSidebar } from "@/contexts/SidebarContext";


//  User model đúng chuẩn TypeScript, không dùng any nữa
interface User {
  fullName: string;
  email: string;
  avatarURL?: string;
  role: "Admin" | "Tutor" | "Learner";
}

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  //  must call hook here, không để trong try/catch
  let sidebarContext: ReturnType<typeof useSidebar> | null = null;
  try {
    sidebarContext = useSidebar();
  } catch {
    sidebarContext = null;
  }

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token =
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token");

  const isAuthenticated = !!token;

  //  user có kiểu User hoặc null, không dùng any
  const [user, setUser] = useState<User | null>(null);

  /**  Fetch user thông tin sau khi login */
  useEffect(() => {
    if (!isAuthenticated) return;

    api.get("/users/myInfo")
        .then((res) => setUser(res.data.result as User))
        .catch(() => {
          localStorage.removeItem("access_token");
          sessionStorage.removeItem("access_token");
          navigate(ROUTES.SIGN_IN);
        });
  }, [isAuthenticated, navigate]);

  /**  Logout không cần redux */
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token");
    navigate(ROUTES.SIGN_IN, { replace: true });
  };

  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
  };

  const isTutorPage = location.pathname.startsWith("/tutor");
  const isActive = (path: string) => location.pathname === path;

  return (
      <header className="bg-background border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="w-full px-8 lg:px-16">
          <div className="flex justify-between items-center h-16">

            {/* Logo + Sidebar toggle */}
            <div className="flex items-center gap-4">
              {isTutorPage && sidebarContext && (
                  <Button variant="ghost" size="icon" onClick={sidebarContext.toggle}>
                    <Menu className="w-6 h-6" />
                  </Button>
              )}

              <Link to={isTutorPage ? ROUTES.TUTOR_DASHBOARD : ROUTES.HOME} className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  Lingua<span className="text-primary">Hub</span>
                  {isTutorPage && <span className="ml-2 text-sm text-gray-500">Tutor</span>}
                </div>
              </Link>
            </div>

            {/* Navigation (hide when tutor page) */}
            {!isTutorPage && (
                <nav className="hidden md:flex space-x-8">
                  <Link
                      to={ROUTES.HOME}
                      className={cn("font-medium transition-colors", isActive(ROUTES.HOME) ? "text-primary" : "text-muted-foreground hover:text-primary")}
                  >
                    Home
                  </Link>
                  <Link
                      to={ROUTES.LANGUAGES}
                      className={cn("font-medium transition-colors", isActive(ROUTES.LANGUAGES) ? "text-primary" : "text-muted-foreground hover:text-primary")}
                  >
                    Languages
                  </Link>
                  <Link
                      to={ROUTES.TUTORS}
                      className={cn("font-medium transition-colors", isActive(ROUTES.TUTORS) ? "text-primary" : "text-muted-foreground hover:text-primary")}
                  >
                    Tutors
                  </Link>
                  <Link
                      to={ROUTES.BECOME_TUTOR}
                      className={cn("font-medium transition-colors", isActive(ROUTES.BECOME_TUTOR) ? "text-primary" : "text-muted-foreground hover:text-primary")}
                  >
                    Become Tutor
                  </Link>
                  <Link
                      to={ROUTES.POLICY}
                      style={{ marginLeft: '4cm' }}
                      className={cn(
                          "font-medium transition-colors opacity-70 hover:opacity-100",
                          isActive(ROUTES.POLICY)
                              ? "text-primary"
                              : "text-muted-foreground hover:text-primary"
                      )}
                  >
                    Privacy & Terms
                  </Link>
                </nav>
            )}

            {/* Right Section */}
            <div className="flex items-center space-x-4">

              <Button variant="ghost" size="icon" asChild>
                <Link to={ROUTES.WISHLIST}>
                  <Heart className="w-5 h-5" />
                </Link>
              </Button>

              {/* Notifications */}
              <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Bell className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                    No notifications
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Auth menu */}
              {!isAuthenticated ? (
                  <>
                    <Button variant="ghost" asChild><Link to={ROUTES.SIGN_IN}>Sign In</Link></Button>
                    <Button asChild><Link to={ROUTES.SIGN_UP}>Sign Up</Link></Button>
                  </>
              ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-10 w-10 rounded-full p-0">
                        <Avatar>
                          <AvatarImage src={user?.avatarURL} />
                          <AvatarFallback>{getUserInitials()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{user?.fullName}</span>
                          <span className="text-xs text-muted-foreground">{user?.email}</span>
                        </div>
                      </DropdownMenuLabel>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link to={ROUTES.PROFILE}><User className="mr-2 h-4 w-4" /> Hồ sơ</Link>
                      </DropdownMenuItem>

                      {user?.role === "Tutor" && (
                          <DropdownMenuItem asChild>
                            <Link to={ROUTES.TUTOR_DASHBOARD}><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</Link>
                          </DropdownMenuItem>
                      )}

                      {user?.role === "Learner" && (
                          <>
                            <DropdownMenuItem asChild><Link to="/my-courses"><BookOpen className="mr-2 h-4 w-4" /> Khóa học của tôi</Link></DropdownMenuItem>
                            <DropdownMenuItem asChild><Link to="/my-enrollments"><GraduationCap className="mr-2 h-4 w-4" /> Tiến độ học</Link></DropdownMenuItem>
                          </>
                      )}

                      <DropdownMenuItem asChild>
                        <Link to="/payment-history"><CreditCard className="mr-2 h-4 w-4" /> Lịch sử thanh toán</Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to={ROUTES.CHANGE_PASSWORD}><Lock className="mr-2 h-4 w-4" /> Đổi mật khẩu</Link>
                      </DropdownMenuItem>

                      {(user?.role === "Tutor" || user?.role === "Admin") && (
                          <DropdownMenuItem asChild>
                            <Link to={user.role === "Tutor" ? "/tutor/settings" : "/settings"}>
                              <Settings className="mr-2 h-4 w-4" /> Cài đặt
                            </Link>
                          </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              )}

              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile nav */}
          {!isTutorPage && mobileMenuOpen && (
              <div className="md:hidden border-t bg-white shadow-md">
                <nav className="flex flex-col p-4 space-y-2">
                  <Link to={ROUTES.HOME} onClick={() => setMobileMenuOpen(false)}>Home</Link>
                  <Link to={ROUTES.LANGUAGES} onClick={() => setMobileMenuOpen(false)}>Languages</Link>
                  <Link to={ROUTES.TUTORS} onClick={() => setMobileMenuOpen(false)}>Tutors</Link>
                  <Link to={ROUTES.BECOME_TUTOR} onClick={() => setMobileMenuOpen(false)}>Become Tutor</Link>
                  <Link to={ROUTES.POLICY} onClick={() => setMobileMenuOpen(false)}>Privacy & Terms</Link>
                </nav>
              </div>
          )}
        </div>
      </header>
  );
};

export default Header;
