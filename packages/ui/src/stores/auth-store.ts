import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type FormViews = "signin" | "signup" | "otp";
export type OtpType = "signup" | "email_change";

interface AuthState {
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
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
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
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        otpEmail: state.otpEmail,
        otpType: state.otpType,
        formView: state.formView,
      }),
    }
  )
);
