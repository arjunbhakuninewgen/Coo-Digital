
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  employeeRedirect?: boolean;
}

const ProtectedRoute = ({ 
  children,
  allowedRoles = ["admin", "manager", "teamlead", "employee"],
  employeeRedirect = true
}: ProtectedRouteProps) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect employees to time tracking page if they try to access non-employee pages
  if (employeeRedirect && user?.role === "employee" && 
      window.location.pathname !== "/time-tracking" && 
      window.location.pathname !== "/employee-profile") {
    return <Navigate to="/time-tracking" replace />;
  }

  // Check if user role is allowed
  if (user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
