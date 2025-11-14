import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import api from "@/config/axiosConfig"; // axios with token interceptor

//  Validation schema
const changePasswordSchema = z
    .object({
      oldPassword: z.string().min(6, "Current password must be at least 6 characters"),
      newPassword: z
          .string()
          .min(8, "New password must be at least 8 characters")
          .regex(/[A-Z]/, "Must include at least 1 uppercase letter")
          .regex(/[a-z]/, "Must include at least 1 lowercase letter")
          .regex(/[0-9]/, "Must include at least 1 number"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export const ChangePasswordForm = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const newPasswordValue = watch("newPassword");
  const confirmPasswordValue = watch("confirmPassword");

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await api.post("/users/change-password", {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      setSuccess(true);
      reset();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(" Failed to change password. Please check your current password.");
      console.error("Error changing password:", err);
    }
  };

  return (
      <Card className="p-6">
        {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800 font-medium">Password changed successfully!</p>
            </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Current Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                  {...register("oldPassword")}
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="pr-10"
              />
              <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrent ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.oldPassword && (
                <p className="text-sm text-red-600">{errors.oldPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-2 border-t pt-6">
            <label className="text-sm font-medium text-gray-700">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                  {...register("newPassword")}
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className="pr-10"
              />
              <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNew ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword.message}</p>
            )}

            <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
              <li>At least 8 characters</li>
              <li>1 uppercase letter (A-Z)</li>
              <li>1 lowercase letter (a-z)</li>
              <li>1 number (0-9)</li>
            </ul>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className={`pr-10 ${
                      confirmPasswordValue && confirmPasswordValue !== newPasswordValue
                          ? "border-red-500"
                          : ""
                  }`}
              />
              <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => reset()}>
              Reset
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? "Saving..." : "Save New Password"}
            </Button>
          </div>
        </form>
      </Card>
  );
};
