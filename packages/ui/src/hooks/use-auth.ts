import { useState } from "react";
import { useTheme } from "next-themes";
import { isTauri } from "@tauri-apps/api/core";
import { openUrl } from "@tauri-apps/plugin-opener";
import { start, cancel, onUrl } from "@fabianlars/tauri-plugin-oauth";
import { VerifyOtpParams, ResendParams, Provider } from "@supabase/supabase-js";
import { useTranslations, useLocale } from "@workspace/i18n";
import { createClient } from "@workspace/ui/lib/supabase";
import { getAuthErrorKey } from "@workspace/ui/lib/auth-errors";
import { getOAuthResponseHtml } from "@workspace/ui/scripts/oauth-response";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const tAuthErrors = useTranslations("AuthErrors");
  const { resolvedTheme } = useTheme();
  const locale = useLocale();

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

  const signInWithNativeProvider = async (provider: Provider) => {
    setLoading(true);
    setError(null);

    try {
      const port = await start({
        ports: [8000, 8001, 8002],
        response: getOAuthResponseHtml({
          locale,
          isDark: resolvedTheme === "dark",
        }),
      });
      const redirectUrl = `http://localhost:${port}`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        await cancel(port);
        const msg = error
          ? tAuthErrors(getAuthErrorKey(error.message))
          : "Failed to get OAuth URL";
        setError(msg);
        setLoading(false);
        return { error: msg };
      }

      await openUrl(data.url);

      return new Promise<{ error: string | null }>((resolve) => {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            console.log("OAuth: Session received via onAuthStateChange");
            subscription.unsubscribe();
            setLoading(false);
            resolve({ error: null });
          }
        });

        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          cancel(port).catch(() => {});
          setError("OAuth timeout");
          setLoading(false);
          resolve({ error: "OAuth timeout" });
        }, 120000);

        onUrl(async (url) => {
          try {
            console.log("OAuth callback received:", url);
            const urlObj = new URL(url);

            const errorParam =
              urlObj.searchParams.get("error_description") ||
              urlObj.searchParams.get("error") ||
              (urlObj.hash &&
                new URLSearchParams(urlObj.hash.substring(1)).get(
                  "error_description"
                )) ||
              (urlObj.hash &&
                new URLSearchParams(urlObj.hash.substring(1)).get("error"));

            if (errorParam) {
              clearTimeout(timeout);
              subscription.unsubscribe();
              await cancel(port);
              setError(errorParam);
              setLoading(false);
              resolve({ error: errorParam });
              return;
            }

            const code = urlObj.searchParams.get("code");

            if (code) {
              const { error: exchangeError } =
                await supabase.auth.exchangeCodeForSession(code);

              await cancel(port).catch(() => {});

              if (exchangeError) {
                console.error(
                  "Exchange error (may be okay):",
                  exchangeError.message
                );

                setTimeout(async () => {
                  const {
                    data: { session },
                  } = await supabase.auth.getSession();

                  if (session) {
                    console.log("OAuth: Session found after exchange error");
                    clearTimeout(timeout);
                    subscription.unsubscribe();
                    setLoading(false);
                    resolve({ error: null });
                  } else {
                    clearTimeout(timeout);
                    subscription.unsubscribe();
                    const msg = tAuthErrors(
                      getAuthErrorKey(exchangeError.message)
                    );
                    setError(msg);
                    setLoading(false);
                    resolve({ error: msg });
                  }
                }, 1000);
                return;
              }

              clearTimeout(timeout);
              return;
            }

            await cancel(port).catch(() => {});

            const hashParams = new URLSearchParams(urlObj.hash.substring(1));

            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");

            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              clearTimeout(timeout);
              subscription.unsubscribe();

              if (sessionError) {
                const msg = tAuthErrors(getAuthErrorKey(sessionError.message));
                setError(msg);
                setLoading(false);
                resolve({ error: msg });
                return;
              }

              setLoading(false);
              resolve({ error: null });
            } else {
              console.log(
                "OAuth: Waiting for session via onAuthStateChange..."
              );
            }
          } catch (err) {
            console.error("OAuth callback error:", err);
            clearTimeout(timeout);
            subscription.unsubscribe();
            await cancel(port).catch(() => {});
            const msg =
              err instanceof Error ? err.message : "OAuth callback failed";
            setError(msg);
            setLoading(false);
            resolve({ error: msg });
          }
        });
      });
    } catch (err) {
      console.error("OAuth error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
      return { error: msg };
    }
  };

  const signInWithWebProvider = async (provider: Provider) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        const msg = tAuthErrors(getAuthErrorKey(error.message));
        setError(msg);
        setLoading(false);
        return { error: msg };
      }

      return { error: null };
    } catch (err) {
      console.error("OAuth error:", err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
      return { error: msg };
    }
  };

  const signInWithProvider = async (provider: Provider) => {
    if (isTauri()) {
      return signInWithNativeProvider(provider);
    }
    return signInWithWebProvider(provider);
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
    signInWithProvider,
    signInWithNativeProvider,
    signInWithWebProvider,
  };
}
