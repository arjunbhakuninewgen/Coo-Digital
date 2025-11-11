
import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id: string;
  profiles: {
    email: string;
    name: string;
  };
}

export interface LoginResult {
  employee: Employee;
  requiresPasswordChange: boolean;
}

export const handleEmployeeLogin = async (email: string, password: string): Promise<LoginResult> => {
  console.log("Attempting employee login for:", email);
  
  // Check if employee exists in database
  const { data: employee, error: employeeError } = await supabase
    .from('employees')
    .select(`
      id,
      profiles!inner(email, name)
    `)
    .eq('profiles.email', email)
    .maybeSingle();

  if (employeeError) {
    console.log("Database error checking employee:", employeeError);
    throw new Error("Database error occurred");
  }

  if (!employee) {
    console.log("Employee not found in database");
    throw new Error("Employee not found in database");
  }

  console.log("Employee found:", employee);

  // If it's the default password, trigger first-time login flow
  if (password === "welcome123") {
    console.log("Default password detected, triggering first-time setup");
    return { employee, requiresPasswordChange: true };
  }

  // Try regular Supabase auth for custom passwords
  console.log("Attempting Supabase auth with custom password");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.log("Supabase auth failed:", error);
    throw new Error("Invalid credentials");
  }

  if (!data.user) {
    console.log("No user returned from Supabase auth");
    throw new Error("Authentication failed");
  }

  console.log("Supabase auth successful");
  return { employee, requiresPasswordChange: false };
};

export const initiatePasswordReset = async (email: string) => {
  console.log("Initiating password reset for:", email);
  
  // Always use the deployed URL for password reset
  const redirectTo = 'https://preview--agency-command-centre-india.lovable.app/reset-password';
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo,
  });
  
  if (error) {
    console.error("Password reset initiation failed:", error);
    throw new Error("Failed to initiate password reset");
  }
  
  return { success: true };
};

export const updatePassword = async (newPassword: string) => {
  console.log("Updating password");
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    console.error("Password update failed:", error);
    throw new Error("Failed to update password");
  }
  
  return { success: true };
};

export const handlePasswordChange = async (email: string, newPassword: string) => {
  console.log("Starting password change process for:", email);
  
  try {
    // For first-time login, create the user account
    console.log("Creating new account for first-time login");
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: newPassword,
      options: {
        data: {
          name: email.split('@')[0],
        }
      }
    });

    if (error) {
      console.error("Sign up failed:", error);
      
      // If user already exists, they can just login with the new password
      if (error.message.includes('already registered')) {
        console.log("User already exists, trying to sign in");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: newPassword,
        });
        
        if (signInError) {
          console.error("Sign in failed:", signInError);
          throw new Error("Account exists but password doesn't match. Please contact your administrator.");
        }
        
        console.log("Sign in successful after account existed");
        
        // Ensure profile exists for this user
        if (signInData.user) {
          await ensureProfileExists(signInData.user.id, email);
        }
        
        return { success: true };
      }
      
      throw new Error(`Failed to create account: ${error.message}`);
    }

    console.log("Account created successfully");
    
    // Ensure profile exists for the new user
    if (data.user) {
      await ensureProfileExists(data.user.id, email);
    }
    
    return { success: true };
    
  } catch (error) {
    console.error("Password change error:", error);
    throw error;
  }
};

// Helper function to ensure a profile exists for a user
const ensureProfileExists = async (userId: string, email: string) => {
  console.log("Ensuring profile exists for user:", userId);
  
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    
    if (existingProfile) {
      console.log("Profile already exists");
      return;
    }
    
    // Create profile if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        name: email.split('@')[0],
        role: 'employee'
      });
    
    if (profileError) {
      console.error("Failed to create profile:", profileError);
      // Don't throw here - the user can still function without a profile
    } else {
      console.log("Profile created successfully");
    }
  } catch (error) {
    console.error("Error ensuring profile exists:", error);
    // Don't throw - the user can still function
  }
};
