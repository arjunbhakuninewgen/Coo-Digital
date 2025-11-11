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

  const createBasicUserFromAuth = (authUser: SupabaseUser): AppUser => ({
    id: authUser.id,
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    role: "employee",
  });

  const fetchAndSetUserProfile = async (authUser: SupabaseUser) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const { data: employee } = await supabase
        .from('employees')
        .select(`
          *,
          employee_skills(skills(name))
        `)
        .eq('id', authUser.id)
        .maybeSingle();

      const skills = employee?.employee_skills?.map((es: any) => es.skills?.name) || [];

      const userProfile: AppUser = {
        id: profile?.id || authUser.id,
        name: profile?.name || authUser.email?.split('@')[0] || "User",
        email: profile?.email || authUser.email!,
        role: profile?.role || "employee",
        phone: profile?.phone,
        department: employee?.department,
        joiningDate: employee?.joining_date,
        skills,
        experience: employee?.experience,
        ctc: employee?.ctc,
      };
      setUser(userProfile);
    } catch (error) {
      console.error("Error loading user profile:", error);
      setUser(createBasicUserFromAuth(authUser));
    }
  };

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error("Error getting session:", error);

      const currentSession = data?.session;
      setSession(currentSession);

      if (currentSession?.user && active) {
        await fetchAndSetUserProfile(currentSession.user);
      }

      setLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setSession(session);
      if (session?.user) fetchAndSetUserProfile(session.user);
      else setUser(null);
      setLoading(false);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setSession(data.session);
      if (data.user) await fetchAndSetUserProfile(data.user);
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

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
      {!loading && children}
    </AuthContext.Provider>
  );
};
