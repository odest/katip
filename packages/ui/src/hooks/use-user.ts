import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { database } from "@workspace/ui/db";
import { createClient } from "@workspace/ui/lib/supabase";
import {
  users,
  type User as UserType,
} from "@workspace/database/schema/sqlite";
import { useSync } from "@workspace/ui/hooks/use-sync";
import { useAuthStore } from "@workspace/ui/stores/auth-store";
import { useUserStore } from "@workspace/ui/stores/user-store";

const supabase = createClient();
const AVATAR_BUCKET = "avatars";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const { localUser, setLocalUser } = useUserStore();
  const [loading, setLoading] = useState(true);
  const { userId: guestId, setUserId: setStoreUserId } = useAuthStore();
  const { migrateGuestData } = useSync();
  const syncedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    const syncProfileFromPublic = async (userId: string, authUser: User) => {
      try {
        const existingLocalUser = await database.query.users.findFirst({
          where: eq(users.id, userId),
        });

        if (existingLocalUser && syncedUserIdRef.current === userId) {
          return existingLocalUser;
        }

        const { data: publicProfile, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (error || !publicProfile) {
          console.warn("Public profile not found, auth metadata will be used.");
          return null;
        }

        if (
          existingLocalUser &&
          existingLocalUser.updatedAt &&
          publicProfile.updated_at
        ) {
          const localTime = new Date(existingLocalUser.updatedAt).getTime();
          const remoteTime = new Date(publicProfile.updated_at).getTime();
          const diff = Math.abs(localTime - remoteTime);

          if (diff < 2000) {
            syncedUserIdRef.current = userId;
            return existingLocalUser;
          }
        }

        await database
          .insert(users)
          .values({
            id: publicProfile.id,
            email: publicProfile.email || authUser.email || "",
            fullName: publicProfile.full_name,
            avatarUrl: publicProfile.avatar_url,
            createdAt: publicProfile.created_at
              ? new Date(publicProfile.created_at)
              : new Date(),
            updatedAt: publicProfile.updated_at
              ? new Date(publicProfile.updated_at)
              : new Date(),
          })
          .onConflictDoUpdate({
            target: users.id,
            set: {
              fullName: publicProfile.full_name,
              avatarUrl: publicProfile.avatar_url,
              email: publicProfile.email,
              updatedAt: publicProfile.updated_at
                ? new Date(publicProfile.updated_at)
                : new Date(),
            },
          });

        syncedUserIdRef.current = userId;

        return {
          id: publicProfile.id,
          email: publicProfile.email || authUser.email || "",
          fullName: publicProfile.full_name,
          avatarUrl: publicProfile.avatar_url,
          createdAt: publicProfile.created_at
            ? new Date(publicProfile.created_at)
            : new Date(),
          updatedAt: publicProfile.updated_at
            ? new Date(publicProfile.updated_at)
            : new Date(),
        } as UserType;
      } catch (err) {
        console.error("Profile sync error:", err);
        return null;
      }
    };

    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const syncedUser = await syncProfileFromPublic(user.id, user);

        try {
          if (syncedUser) {
            setLocalUser(syncedUser);
          } else {
            const dbUser = await database.query.users.findFirst({
              where: eq(users.id, user.id),
            });
            if (dbUser) setLocalUser(dbUser);
          }
        } catch (error) {
          console.error("Failed to fetch local user:", error);
        }

        if (guestId && guestId !== user.id) {
          const userDataForMigration = {
            id: syncedUser?.id ?? user.id,
            email: syncedUser?.email ?? user.email ?? "",
            fullName:
              syncedUser?.fullName ?? user.user_metadata.full_name ?? "",
            avatarUrl:
              syncedUser?.avatarUrl ?? user.user_metadata.avatar_url ?? "",
            createdAt: syncedUser?.createdAt
              ? syncedUser.createdAt.toISOString()
              : user.created_at,
            updatedAt: syncedUser?.updatedAt
              ? syncedUser.updatedAt.toISOString()
              : user.updated_at!,
          };

          await migrateGuestData(guestId, userDataForMigration);
          setStoreUserId(user.id);
        } else {
          setStoreUserId(user.id);
        }
      }

      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        syncedUserIdRef.current = null;
      }

      if (session?.user) {
        const syncedUser = await syncProfileFromPublic(
          session.user.id,
          session.user
        );

        try {
          if (syncedUser) {
            setLocalUser(syncedUser);
          } else {
            const dbUser = await database.query.users.findFirst({
              where: eq(users.id, session.user.id),
            });
            if (dbUser) setLocalUser(dbUser);
          }
        } catch (error) {
          console.error("Failed to fetch local user:", error);
        }

        if (guestId && guestId !== session.user.id) {
          const userDataForMigration = {
            id: syncedUser?.id ?? session.user.id,
            email: syncedUser?.email ?? session.user.email ?? "",
            fullName:
              syncedUser?.fullName ??
              session.user.user_metadata.full_name ??
              "",
            avatarUrl:
              syncedUser?.avatarUrl ??
              session.user.user_metadata.avatar_url ??
              "",
            createdAt: syncedUser?.createdAt
              ? syncedUser.createdAt.toISOString()
              : session.user.created_at,
            updatedAt: syncedUser?.updatedAt
              ? syncedUser.updatedAt.toISOString()
              : session.user.updated_at!,
          };

          await migrateGuestData(guestId, userDataForMigration);
        }
        setStoreUserId(session.user.id);
      } else {
        setLocalUser(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [guestId, migrateGuestData, setStoreUserId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setStoreUserId(null);
    setLocalUser(null);
  }, [setStoreUserId]);

  const uploadAvatar = useCallback(
    async (dataUrl: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || !user.email)
        return { success: false, error: "User not authenticated" };

      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const fileName = `${user.id}/${Date.now()}.webp`;

        let oldAvatarUrl = localUser?.avatarUrl;

        if (!oldAvatarUrl) {
          const { data: publicData } = await supabase
            .from("users")
            .select("avatar_url")
            .eq("id", user.id)
            .single();
          oldAvatarUrl = publicData?.avatar_url;
        }

        if (oldAvatarUrl && oldAvatarUrl.includes(`/${AVATAR_BUCKET}/`)) {
          const match = oldAvatarUrl.match(
            new RegExp(`/${AVATAR_BUCKET}/(.+)$`)
          );
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

        const { error: updateError } = await supabase
          .from("users")
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        try {
          await database
            .update(users)
            .set({ avatarUrl: publicUrl, updatedAt: new Date() })
            .where(eq(users.id, user.id));

          if (localUser) {
            setLocalUser({
              ...localUser,
              avatarUrl: publicUrl,
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Failed to update avatar in local database:", error);
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Upload failed",
        };
      }
    },
    [user, localUser, setLocalUser]
  );

  const removeAvatar = useCallback(async (): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!user || !user.email)
      return { success: false, error: "User not authenticated" };

    try {
      let avatarUrl = localUser?.avatarUrl;

      if (!avatarUrl) {
        const { data: publicData } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", user.id)
          .single();
        avatarUrl = publicData?.avatar_url;
      }

      if (avatarUrl && avatarUrl.includes(`/${AVATAR_BUCKET}/`)) {
        const match = avatarUrl.match(new RegExp(`/${AVATAR_BUCKET}/(.+)$`));
        if (match && match[1]) {
          const filePath = decodeURIComponent(match[1]);
          await supabase.storage
            .from(AVATAR_BUCKET)
            .remove([filePath])
            .catch(console.error);
        }
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      try {
        await database
          .update(users)
          .set({ avatarUrl: null, updatedAt: new Date() })
          .where(eq(users.id, user.id));

        if (localUser) {
          setLocalUser({
            ...localUser,
            avatarUrl: null,
            updatedAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Failed to remove avatar from local database:", error);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Remove failed",
      };
    }
  }, [user, localUser, setLocalUser]);

  const updateName = useCallback(
    async (newName: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || !user.email) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        const { error: updateError } = await supabase
          .from("users")
          .update({ full_name: newName, updated_at: new Date().toISOString() })
          .eq("id", user.id);

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        try {
          await database
            .update(users)
            .set({ fullName: newName, updatedAt: new Date() })
            .where(eq(users.id, user.id));

          if (localUser) {
            setLocalUser({
              ...localUser,
              fullName: newName,
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Failed to update name in local database:", error);
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Name update failed",
        };
      }
    },
    [user, localUser, setLocalUser]
  );

  const updateEmail = useCallback(
    async (
      newEmail: string,
      currentPassword: string
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
          return { success: false, error: "incorrectPassword" };
        }

        const { error: updateError } = await supabase.auth.updateUser({
          email: newEmail,
        });

        if (updateError) {
          return { success: false, error: updateError.message };
        }

        try {
          await database
            .update(users)
            .set({ email: newEmail, updatedAt: new Date() })
            .where(eq(users.id, user.id));

          if (localUser) {
            setLocalUser({
              ...localUser,
              email: newEmail,
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error("Failed to update email in local database:", error);
        }

        return { success: true };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Email update failed",
        };
      }
    },
    [user, localUser, setLocalUser]
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

      let avatarUrl = localUser?.avatarUrl;

      if (!avatarUrl) {
        const { data: publicData } = await supabase
          .from("users")
          .select("avatar_url")
          .eq("id", user.id)
          .single();
        avatarUrl = publicData?.avatar_url;
      }

      if (avatarUrl && avatarUrl.includes(`/${AVATAR_BUCKET}/`)) {
        const match = avatarUrl.match(new RegExp(`/${AVATAR_BUCKET}/(.+)$`));
        if (match && match[1]) {
          const filePath = decodeURIComponent(match[1]);
          await supabase.storage
            .from(AVATAR_BUCKET)
            .remove([filePath])
            .catch(console.error);
        }
      }

      try {
        await database.delete(users).where(eq(users.id, user.id));
      } catch (dbError) {
        console.error("Failed to delete user from local database:", dbError);
      }

      await signOut();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Account deletion failed",
      };
    }
  }, [user, localUser, signOut]);

  const fullName = useMemo(() => {
    if (loading) return null;
    if (localUser !== null) {
      return localUser.fullName;
    }
    return user?.user_metadata?.full_name || null;
  }, [localUser, user?.user_metadata?.full_name]);

  const email = useMemo(() => {
    if (loading) return null;
    if (localUser !== null) {
      return localUser.email;
    }
    return user?.email || null;
  }, [localUser, user?.email]);

  const avatarUrl = useMemo(() => {
    if (loading) return null;
    if (localUser !== null) {
      return localUser.avatarUrl;
    }
    return user?.user_metadata?.avatar_url || null;
  }, [localUser, user?.user_metadata?.avatar_url]);

  const avatarFallback = useMemo(() => {
    if (loading) return null;
    const name = localUser?.fullName || user?.user_metadata?.full_name;
    const mail = localUser?.email || user?.email;

    if (name) return name.substring(0, 2).toUpperCase();
    if (mail) return mail.substring(0, 2).toUpperCase();

    return null;
  }, [localUser, user]);

  return {
    user,
    loading,
    signOut,
    uploadAvatar,
    removeAvatar,
    updateName,
    updateEmail,
    changePassword,
    deleteAccount,
    fullName,
    email,
    avatarUrl,
    avatarFallback,
  };
}
