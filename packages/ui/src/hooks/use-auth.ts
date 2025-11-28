import { useState } from "react";
import { VerifyOtpParams, ResendParams } from "@supabase/supabase-js";
import { useTranslations } from "@workspace/i18n";
import { createClient } from "@workspace/ui/lib/supabase";
import { getAuthErrorKey } from "@workspace/ui/lib/auth-errors";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const tAuthErrors = useTranslations("AuthErrors");

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const msg = tAuthErrors(getAuthErrorKey(error.message));
      setError(msg);
      setLoading(false);
      return { data, error: msg };
    }

    setLoading(false);
    return { data, error: null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      const msg = tAuthErrors(getAuthErrorKey(error.message));
      setError(msg);
      setLoading(false);
      return { data, error: msg };
    }

    setLoading(false);
    return { data, error: null };
  };

  const verifyOtp = async (params: VerifyOtpParams) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.verifyOtp(params);

    if (error) {
      const msg = tAuthErrors(getAuthErrorKey(error.message));
      setError(msg);
      setLoading(false);
      return { data, error: msg };
    }

    setLoading(false);
    return { data, error: null };
  };

  const resendOtp = async (params: ResendParams) => {
    setError(null);
    const { error } = await supabase.auth.resend(params);

    if (error) {
      const msg = tAuthErrors(getAuthErrorKey(error.message));
      setError(msg);
      return { error: msg };
    }
    return { error: null };
  };

  const resetPasswordRequest = async (email: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      const msg = tAuthErrors(getAuthErrorKey(error.message));
      setError(msg);
      setLoading(false);
      return { error: msg };
    }

    setLoading(false);
    return { error: null };
  };

  const resetPassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      const msg = tAuthErrors(getAuthErrorKey(error.message));
      setError(msg);
      setLoading(false);
      return { error: msg };
    }

    setLoading(false);
    return { error: null };
  };

  return {
    loading,
    error,
    setError,
    signIn,
    signUp,
    verifyOtp,
    resendOtp,
    resetPasswordRequest,
    resetPassword,
  };
}
