import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type FormViews =
  | "signin"
  | "signup"
  | "otp"
  | "forgot-password"
  | "reset-password";
export type OtpType = "signup" | "email_change" | "recovery";

interface AuthState {
  userId: string | null;
  setUserId: (userId: string | null) => void;
  formView: FormViews;
  setFormView: (formView: FormViews) => void;
  openDialog: boolean;
  setOpenDialog: (openDialog: boolean) => void;
  openLogoutDialog: boolean;
  setOpenLogoutDialog: (openLogoutDialog: boolean) => void;
  otpEmail: string;
  setOtpEmail: (otpEmail: string) => void;
  otpType: OtpType;
  setOtpType: (otpType: OtpType) => void;
  isHydrated: boolean;
  setHydrated: (isHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      setUserId: (userId: string | null) => {
        set({ userId });
      },

      formView: "signin",
      setFormView: (formView: FormViews) => {
        set({ formView });
      },

      openDialog: false,
      setOpenDialog: (openDialog: boolean) => {
        set({ openDialog });
      },

      openLogoutDialog: false,
      setOpenLogoutDialog: (openLogoutDialog: boolean) => {
        set({ openLogoutDialog });
      },

      otpEmail: "",
      setOtpEmail: (otpEmail: string) => {
        set({ otpEmail });
      },

      otpType: "signup",
      setOtpType: (otpType: OtpType) => {
        set({ otpType });
      },

      isHydrated: false,
      setHydrated: (isHydrated: boolean) => {
        set({ isHydrated });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      partialize: (state) => ({
        userId: state.userId,
        otpEmail: state.otpEmail,
        otpType: state.otpType,
        formView: state.formView,
      }),
    }
  )
);
