import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { PropsWithChildren } from "react";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
