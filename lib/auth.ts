import { convex } from "./convex";

// Lazy import to avoid crashing in Expo Go (native module not available)
function getAppleAuth() {
  return require("expo-apple-authentication") as typeof import("expo-apple-authentication");
}

export async function signInWithApple(): Promise<{
  token: string;
  email: string;
  name?: string;
}> {
  const AppleAuthentication = getAppleAuth();

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    ],
  });

  if (!credential.identityToken) {
    throw new Error("No identity token from Apple");
  }

  const name =
    credential.fullName?.givenName && credential.fullName?.familyName
      ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
      : undefined;

  return {
    token: credential.identityToken,
    email: credential.email ?? "",
    name,
  };
}

export async function signOut() {
  convex.clearAuth();
}
