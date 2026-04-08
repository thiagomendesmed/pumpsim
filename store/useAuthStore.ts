import { create } from "zustand";
import { signInWithApple, signOut as authSignOut } from "@/lib/auth";
import { loginUser, logoutUser } from "@/lib/purchases";
import { convex } from "@/lib/convex";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AUTH_TOKEN_KEY = "bombasim_auth_token";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  email: string | null;
  name: string | null;

  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  email: null,
  name: null,

  signIn: async () => {
    set({ isLoading: true });
    try {
      const result = await signInWithApple();

      // Set auth on Convex
      convex.setAuth(async () => result.token);

      // Identify user in RevenueCat (links purchases to account)
      try {
        await loginUser(result.email || result.token);
      } catch {
        // Non-blocking — purchases still work anonymously
      }

      await AsyncStorage.setItem(AUTH_TOKEN_KEY, result.token);

      set({
        isAuthenticated: true,
        isLoading: false,
        token: result.token,
        email: result.email,
        name: result.name,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    await authSignOut();

    // Reset RevenueCat to anonymous
    try {
      await logoutUser();
    } catch {
      // Non-blocking
    }

    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    set({
      isAuthenticated: false,
      isLoading: false,
      token: null,
      email: null,
      name: null,
    });
  },

  restoreSession: async () => {
    try {
      const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);

      if (token) {
        convex.setAuth(async () => token);
        set({
          isAuthenticated: true,
          isLoading: false,
          token,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
