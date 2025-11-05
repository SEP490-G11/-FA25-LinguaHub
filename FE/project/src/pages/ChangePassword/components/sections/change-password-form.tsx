import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Save, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Mật khẩu hiện tại phải có ít nhất 6 ký tự'),
  newPassword: z.string()
    .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải chứa ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordForm = () => {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    console.log('Changing password:', data);

    await new Promise(resolve => setTimeout(resolve, 1000));

    setSuccess(true);
    reset();

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <Card className="p-6">
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-medium">Mật khẩu đã được thay đổi thành công!</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Mật khẩu hiện tại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              {...register('currentPassword')}
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Nhập mật khẩu hiện tại"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-600">{errors.currentPassword.message}</p>
          )}
        </div>

        <div className="border-t pt-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                {...register('newPassword')}
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu mới"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600">{errors.newPassword.message}</p>
            )}
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-500">Mật khẩu phải có:</p>
              <ul className="text-xs text-gray-500 list-disc list-inside space-y-0.5">
                <li>Ít nhất 8 ký tự</li>
                <li>Ít nhất 1 chữ hoa (A-Z)</li>
                <li>Ít nhất 1 chữ thường (a-z)</li>
                <li>Ít nhất 1 số (0-9)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu mới"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Đặt lại
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
