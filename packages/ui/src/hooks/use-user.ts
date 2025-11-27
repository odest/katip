import { useEffect, useState, useMemo, useCallback } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@workspace/ui/lib/supabase";

const supabase = createClient();

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
    fullName,
    email,
    avatarUrl,
    avatarFallback,
  };
}
