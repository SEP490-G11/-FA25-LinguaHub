import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
//Gộp nhiều className vào 1 chuỗi duy nhất, tự động xử lý trùng lặp.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price);
}

// Thêm dấu chấm phân tách hàng nghìn.
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('vi-VN').format(num);
}

// Chuyển Date thành ngày tiếng Việt đẹp.
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Kiểm tra định dạng email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Giúp trì hoãn việc thực thi hàm
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

