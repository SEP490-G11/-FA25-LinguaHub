import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/config/axiosConfig";
import { Camera, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(9, "Invalid phone number"),
  dob: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other"]),
  country: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export const ProfileForm = () => {
  const [userId, setUserId] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  /** ✅ Load user info on mount */
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await api.get("/users/myInfo");

        const user = res.data.result;
        setUserId(user.userID);
        setAvatarPreview(user.avatarURL);

        reset({
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          dob: user.dob,
          gender: user.gender || "Other",
          country: user.country,
          address: user.address,
          bio: user.bio,
        });
      } catch (error) {
        console.error("❌ Failed to fetch user info:", error);
      }
    };

    fetchUserInfo();
  }, [reset]);

  /** ✅ Save updated profile */
  const onSubmit = async (data: ProfileFormData) => {
    if (!userId) return;

    setLoading(true);

    try {
      const res = await api.patch(`/users/${userId}`, data);

      reset(res.data);
      setIsEditing(false);
      alert("✅ Profile updated successfully!");
    } catch (error) {
      console.error(" Failed to update profile:", error);
      alert(" Update failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
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

  return (
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center space-y-4 pb-6 border-b">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview ?? undefined} />
                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                  {avatarPreview ? "" : "U"}
                </AvatarFallback>
              </Avatar>

              {isEditing && (
                  <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Username</label>
              <Input {...register("username")} disabled={!isEditing} />
              {errors.username && <p className="text-sm text-red-600">{errors.username.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input {...register("fullName")} disabled={!isEditing} />
              {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input type="email" {...register("email")} disabled />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input {...register("phone")} disabled={!isEditing} />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Date of Birth</label>
              <Input type="date" {...register("dob")} disabled={!isEditing} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Gender</label>
              <select {...register("gender")} disabled={!isEditing} className="h-10 rounded border px-3">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && <p className="text-sm text-red-600">{errors.gender.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <Input {...register("country")} disabled={!isEditing} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Address</label>
              <Input {...register("address")} disabled={!isEditing} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">About me</label>
              <Textarea {...register("bio")} disabled={!isEditing} rows={4} />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            {!isEditing ? (
                <Button type="button" onClick={() => setIsEditing(true)}>Edit</Button>
            ) : (
                <>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!isDirty || loading}>
                    {loading ? <Save className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                  </Button>
                </>
            )}
          </div>
        </form>
      </Card>
  );
};
