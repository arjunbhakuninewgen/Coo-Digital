
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
const [isSubmitting, setIsSubmitting] = useState(false);
const { login, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Login page - user state:", user?.email, "role:", user?.role, "loading:", loading);
    
    // Only redirect if we have a user and we're not loading
    if (!loading && user) {
      console.log("User authenticated, redirecting...");
      if (user.role === "employee") {
        console.log("Redirecting employee to time-tracking");
        navigate("/time-tracking", { replace: true });
      } else {
        console.log("Redirecting to dashboard");
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

const handleSubmit = async (email: string, password: string, isSignUp: boolean, name?: string) => {
  if (!email || !password) {
    toast({
      title: "Error",
      description: "Please enter both email and password",
      variant: "destructive",
    });
    return;
  }
  
  setIsSubmitting(true);
  
  try {
    if (isSignUp) {
      toast({
        title: "Demo mode",
        description: "Sign up is disabled in the prototype. Use a demo account.",
      });
      return;
    }
    await login(email, password);
  } catch (error) {
    console.error("Authentication error:", error);
    toast({
      title: "Login Failed",
      description: error instanceof Error ? error.message : "Invalid credentials",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};


  // Show loading while auth state is being determined
  if (loading) {
    console.log("Auth loading, showing loading state");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated
  if (user) {
    console.log("User authenticated, not rendering login form");
    return null;
  }


  return (
    <LoginForm
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default Login;
