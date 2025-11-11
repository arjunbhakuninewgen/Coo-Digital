
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { DEMO_MODE } from "@/config";

export type UserRole = "admin" | "manager" | "teamlead" | "employee";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: "Maintenance" | "Development" | "Social" | "Performance";
  joiningDate?: string;
  skills?: string[];
  experience?: number;
  ctc?: number;
  phone?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  session: null,
});

export const useAuth = () => useContext(AuthContext);

// Mock users for demo purposes
const DEMO_USERS = [
  { email: "admin@agency.com", role: "admin" as UserRole },
  { email: "manager@agency.com", role: "manager" as UserRole },
  { email: "lead@agency.com", role: "teamlead" as UserRole },
  { email: "employee@agency.com", role: "employee" as UserRole },
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const createDemoUser = (email: string, role: UserRole): AppUser => {
    return {
      id: `demo-${email}`,
      name: email.split('@')[0],
      email: email,
      role: role,
    };
  };

  const createBasicUserFromAuth = (authUser: SupabaseUser): AppUser => {
    console.log("Creating basic user from auth data:", authUser);
    return {
      id: authUser.id,
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
      email: authUser.email || '',
      role: "employee", // Default role for new users
    };
  };

  const fetchAndSetUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log("Fetching user profile for:", authUser.id);
      
      // First get the basic profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      console.log("Profile query result:", { profile, profileError });

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        // Create basic user from auth data
        const basicUser = createBasicUserFromAuth(authUser);
        console.log("Setting basic user due to profile error:", basicUser);
        setUser(basicUser);
        return;
      }

      if (!profile) {
        console.log("No profile found, creating basic user");
        // Create basic user from auth data
        const basicUser = createBasicUserFromAuth(authUser);
        console.log("Setting basic user:", basicUser);
        setUser(basicUser);
        return;
      }

      // Then try to get employee data
      const { data: employee } = await supabase
        .from('employees')
        .select(`
          *,
          employee_skills(
            skills(name)
          )
        `)
        .eq('id', authUser.id)
        .maybeSingle();

      const skills = employee?.employee_skills?.map((es: any) => es.skills.name) || [];

      const userProfile = {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
        department: employee?.department,
        joiningDate: employee?.joining_date,
        skills,
        experience: employee?.experience,
        ctc: employee?.ctc,
      };

      console.log("Complete user profile:", userProfile);
      setUser(userProfile);
    } catch (error) {
      console.error('Error in fetchAndSetUserProfile:', error);
      // Fallback to basic user
      const basicUser = createBasicUserFromAuth(authUser);
      console.log("Setting basic user due to error:", basicUser);
      setUser(basicUser);
    }
  };

useEffect(() => {
  if (DEMO_MODE) {
    // In demo mode, skip Supabase listeners entirely
    setLoading(false);
    return;
  }

  console.log("Setting up auth listeners");
  
  // Set up auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, currentSession) => {
      console.log("Auth state change:", event, currentSession?.user?.email);
      
      setSession(currentSession);
      
      if (currentSession?.user) {
        console.log("User authenticated, fetching profile...");
        try {
          await fetchAndSetUserProfile(currentSession.user);
        } catch (error) {
          console.error("Error fetching profile:", error);
          // Set basic user as fallback
          setUser(createBasicUserFromAuth(currentSession.user));
        }
      } else {
        console.log("No user session, clearing user state");
        setUser(null);
      }
      
      // Always set loading to false after handling auth state change
      setLoading(false);
    }
  );

  // Check for existing session
  const initializeAuth = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      console.log("Checking existing session:", currentSession?.user?.email);
      
      if (currentSession?.user) {
        setSession(currentSession);
        try {
          await fetchAndSetUserProfile(currentSession.user);
        } catch (error) {
          console.error("Error fetching profile in init:", error);
          setUser(createBasicUserFromAuth(currentSession.user));
        }
      }
    } catch (error) {
      console.error("Error getting session:", error);
    } finally {
      setLoading(false);
    }
  };

  initializeAuth();

  return () => {
    subscription.unsubscribe();
  };
}, []);

const login = async (email: string, password: string) => {
  console.log("AuthContext login called for:", email);
  setLoading(true);
  
  try {
    // Demo mode: only allow predefined demo accounts
    const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (demoUser && password === 'password') {
      const mockUser = createDemoUser(demoUser.email, demoUser.role);
      setUser(mockUser);
      setSession(null);
      setLoading(false);
      return;
    }

    if (DEMO_MODE) {
      setLoading(false);
      throw new Error("Demo mode: use one of the demo accounts listed on the login screen.");
    }
    
    // For non-demo users, use Supabase auth
    console.log("Regular user login via Supabase");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Supabase login error:", error);
      setLoading(false);
      throw error;
    }
    
    console.log("Supabase login successful:", data.user?.email);
    // Auth state change handler will set user state and loading to false
  } catch (error) {
    console.error("Login error:", error);
    setLoading(false);
    throw error;
  }
};

const logout = async () => {
  console.log("Logging out user:", user?.email);
  const isDemoSession = user && user.id.toString().startsWith('demo-');
  
  if (DEMO_MODE || isDemoSession) {
    console.log("Demo session logout");
    setUser(null);
    setSession(null);
    return;
  }
  
  console.log("Supabase session logout");
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error);
  }
};

  console.log("AuthProvider render - user:", user?.email, "loading:", loading, "isAuthenticated:", !!user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
