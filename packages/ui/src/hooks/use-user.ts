import { useEffect, useState, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@workspace/ui/lib/supabase";

const supabase = createClient();
const AVATAR_BUCKET = "avatars";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const uploadAvatar = useCallback(
    async (dataUrl: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || !user.email)
        return { success: false, error: "User not authenticated" };

      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        const fileName = `${user.id}/${Date.now()}.webp`;

        const oldAvatarUrl = user.user_metadata?.avatar_url;
        if (oldAvatarUrl) {
          const match = oldAvatarUrl.match(/\/avatars\/(.+)$/);
          if (match && match[1]) {
            const oldPath = decodeURIComponent(match[1]);
            await supabase.storage.from(AVATAR_BUCKET).remove([oldPath]);
          }
        }

        const { error: uploadError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .upload(fileName, blob, {
            contentType: "image/webp",
            upsert: true,
          });

        if (uploadError) {
          return { success: false, error: uploadError.message };
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(fileName);

        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    [user]
  );

  const removeAvatar = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!user || !user.email)
      return { success: false, error: "User not authenticated" };

    try {
      const avatarUrl = user.user_metadata?.avatar_url;

      if (avatarUrl) {
        const match = avatarUrl.match(/\/avatars\/(.+)$/);
        if (match && match[1]) {
          const filePath = decodeURIComponent(match[1]);
          const { error: deleteError } = await supabase.storage
            .from(AVATAR_BUCKET)
            .remove([filePath]);

          if (deleteError) {
            return { success: false, error: deleteError.message };
          }
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Remove failed",
      };
    }
  }, [user]);

  const updateName = useCallback(
    async (newName: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || !user.email) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const { error: updateError } = await supabase.auth.updateUser({
          data: { full_name: newName },
        });

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Name update failed",
        };
      }
    },
    [user]
  );

  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!user || !user.email) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (verifyError) {
          return { success: false, error: "incorrectCurrentPassword" };
        }

        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Password change failed",
        };
      }
    },
    [user]
  );

  const deleteAccount = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!user || !user.email) {
      return { success: false, error: "User not authenticated" };
    }

    try {
      const { error } = await supabase.functions.invoke("delete-user", {
        body: { userId: user.id },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const avatarUrl = user.user_metadata?.avatar_url;
      if (avatarUrl) {
        const match = avatarUrl.match(/\/avatars\/(.+)$/);
        if (match && match[1]) {
          const filePath = decodeURIComponent(match[1]);
          await supabase.storage.from(AVATAR_BUCKET).remove([filePath]);
        }
      }

      await supabase.auth.signOut();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Account deletion failed",
      };
    }
  }, [user]);

  const fullName = useMemo(() => {
    return user?.user_metadata?.full_name || null;
  }, [user?.user_metadata?.full_name]);

  const email = useMemo(() => {
    return user?.email || null;
  }, [user?.email]);

  const avatarUrl = useMemo(() => {
    return user?.user_metadata?.avatar_url || null;
  }, [user?.user_metadata?.avatar_url]);

  const avatarFallback = useMemo(() => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return null;
  }, [user?.user_metadata?.full_name, user?.email]);

  return {
    user,
    loading,
    signOut,
    uploadAvatar,
    removeAvatar,
    updateName,
    changePassword,
    deleteAccount,
    fullName,
    email,
    avatarUrl,
    avatarFallback,
  };
}
