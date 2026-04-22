import { useEffect, useRef } from "react";
import { useAuth, useUser } from "@clerk/expo";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { loginUser, logoutUser } from "@/lib/purchases";

export function useClerkUserSync() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);
  const setRevenuecatId = useMutation(api.users.setRevenuecatId);
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    const run = async () => {
      if (isSignedIn && userId && lastSyncedUserId.current !== userId) {
        lastSyncedUserId.current = userId;
        try {
          await getOrCreateUser();
          await setRevenuecatId({ revenuecatCustomerId: userId });
          await loginUser(userId);
        } catch (err) {
          console.warn("Clerk user sync failed:", err);
        }
      } else if (!isSignedIn && lastSyncedUserId.current) {
        lastSyncedUserId.current = null;
        try {
          await logoutUser();
        } catch {
          // RC not configured / already anonymous
        }
      }
    };

    run();
  }, [isLoaded, isSignedIn, userId, user?.primaryEmailAddress?.emailAddress]);
}
