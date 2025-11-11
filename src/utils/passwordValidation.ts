
export interface PasswordValidationResult {
  isValid: boolean;
  error?: string;
}

export const validatePasswords = (
  newPassword: string, 
  confirmPassword: string
): PasswordValidationResult => {
  if (newPassword !== confirmPassword) {
    return {
      isValid: false,
      error: "Passwords do not match"
    };
  }

  if (newPassword.length < 6) {
    return {
      isValid: false,
      error: "Password must be at least 6 characters"
    };
  }

  if (newPassword === "welcome123") {
    return {
      isValid: false,
      error: "Please choose a different password than the default one"
    };
  }

  return { isValid: true };
};
