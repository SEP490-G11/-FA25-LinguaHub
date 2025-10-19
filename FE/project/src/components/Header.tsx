import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bell, Menu, Languages, Heart, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/constants';

const Header = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

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
              to={ROUTES.PRACTICE_TEST}
              className={cn(
                "transition-colors font-medium",
                isActive(ROUTES.PRACTICE_TEST) ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              )}
            >
              Practice Test
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
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" asChild>
              <Link to={ROUTES.SIGN_IN}>
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link to={ROUTES.SIGN_UP}>
                Sign Up
              </Link>
            </Button>
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