import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Save } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
// @ts-ignore
import { AppDispatch, RootState } from '@/redux/store';
// @ts-ignore
import { updateProfile } from '@/redux/slices/userSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// ✅ Validation Schema
const profileSchema = z.object({
  username: z.string().min(3, 'Username phải có ít nhất 3 ký tự'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
  dob: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']),
  country: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { updating } = useSelector((state: RootState) => state.user || { updating: false });
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarURL ?? null);

  // ✅ Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: user?.username ?? '',
      fullName: user?.fullName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      dob: user?.dob ?? '',
      gender: (user?.gender as 'Male' | 'Female' | 'Other') ?? 'Other',
      country: user?.country ?? '',
      address: user?.address ?? '',
      bio: user?.bio ?? '',
    },
  });


  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
      console.log('📤 Submitting profile data:', data);
      const updatedUser = await dispatch(updateProfile(data)).unwrap();
      reset(updatedUser);
      setIsEditing(false);
      alert('✅ Cập nhật hồ sơ thành công!');
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };


  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };


  const getUserInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
  };


  return (
      <Card className="p-6">
        {!user ? (
            <div className="text-center text-gray-500 py-8">
              You need to login to view profile.
            </div>
        ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Header Avatar */}
              <div className="flex flex-col items-center space-y-4 pb-6 border-b">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview || user.avatarURL || undefined} />
                    <AvatarFallback className="bg-blue-500 text-white text-2xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                      <label
                          htmlFor="avatar-upload"
                          className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                      >
                        <Camera className="w-4 h-4 text-white" />
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                        />
                      </label>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">{user.fullName}</h2>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>

              {/* Form content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <Input
                      {...register('username')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                  <Input
                      {...register('fullName')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <Input
                      {...register('email')}
                      type="email" disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                  <Input
                      {...register('phone')}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Ngày sinh</label>
                  <Input
                      {...register('dob')}
                      type="date" disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                  />
                  {errors.dob && <p className="text-sm text-red-600">{errors.dob.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Giới tính</label>
                  <select
                      {...register('gender')}
                      disabled={!isEditing}
                      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none ${
                          !isEditing ? 'bg-gray-50' : ''
                      }`}
                  >
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                    <option value="Other">Khác</option>
                  </select>
                  {errors.gender && <p className="text-sm text-red-600">{errors.gender.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Quốc gia</label>
                  <Input {...register('country')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="Việt Nam" />
                  {errors.country && <p className="text-sm text-red-600">{errors.country.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Địa chỉ</label>
                  <Input {...register('address')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="Nhập địa chỉ của bạn" />
                  {errors.address && <p className="text-sm text-red-600">{errors.address.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Giới thiệu</label>
                  <Textarea {...register('bio')} disabled={!isEditing} className={!isEditing ? 'bg-gray-50' : ''} placeholder="Viết vài dòng về bản thân bạn..." rows={4} />
                  {errors.bio && <p className="text-sm text-red-600">{errors.bio.message}</p>}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                {!isEditing ? (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Chỉnh sửa
                    </Button>
                ) : (
                    <>
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Hủy
                      </Button>
                      <Button type="submit" disabled={!isDirty || updating}>
                        {updating ? (
                            <>
                              <Save className="animate-spin w-4 h-4 mr-2" /> Đang lưu...
                            </>
                        ) : (
                            <>
                              <Save className="w-4 h-4 mr-2" /> Lưu thay đổi
                            </>
                        )}
                      </Button>
                    </>
                )}
              </div>
            </form>
        )}
      </Card>
  );
};
