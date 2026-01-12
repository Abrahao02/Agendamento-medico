import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";
import LoadingFallback from "../components/common/LoadingFallback";

export function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
