export const getAuthErrorKey = (errorMessage: string): string => {
  // Normalize error message (trim, lowercase if needed, though exact match is safer for known strings)
  // Supabase errors are usually consistent.

  if (errorMessage.includes("Invalid login credentials")) {
    return "invalidCredentials";
  }
  if (errorMessage.includes("User already registered")) {
    return "userAlreadyRegistered";
  }
  if (errorMessage.includes("Password should be at least")) {
    return "passwordTooShort";
  }
  if (
    errorMessage.includes("weak") ||
    errorMessage.includes("should contain")
  ) {
    return "weakPassword";
  }
  if (errorMessage.includes("Email not confirmed")) {
    return "emailNotConfirmed";
  }
  if (errorMessage.includes("Token has expired or is invalid")) {
    return "invalidToken";
  }
  if (errorMessage.includes("Email rate limit exceeded")) {
    return "rateLimitExceeded";
  }
  if (errorMessage.includes("Auth session missing")) {
    return "sessionMissing";
  }

  return "defaultError";
};
