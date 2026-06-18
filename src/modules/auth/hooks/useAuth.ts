import { useMutation } from "@tanstack/react-query";
import { authApi } from "@modules/auth/api/authApi";
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyEmailPayload,
} from "@modules/auth/types";
import { useAuthStore } from "@shared/store/useAuthStore";

export const useLogin = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: (res: AuthResponse) => {
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      }
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((s) => s.setAuth);
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: (res: AuthResponse) => {
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      }
    },
  });
};

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authApi.forgotPassword(payload),
  });

export const useResetPassword = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authApi.resetPassword(payload),
  });

export const useVerifyEmail = () => {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (payload: VerifyEmailPayload) => authApi.verifyEmail(payload),
    onSuccess: (res) => {
      if (res?.data?.emailVerified) updateUser({ emailVerified: true });
    },
  });
};

export const useResendVerification = () =>
  useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
  });

export const useLogout = () => {
  const logout = useAuthStore((s) => s.logout);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  return useMutation({
    mutationFn: () => authApi.logout(refreshToken || ""),
    onSuccess: () => logout(),
    onError: () => logout(),
  });
};
