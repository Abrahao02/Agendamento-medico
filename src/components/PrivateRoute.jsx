import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../services/firebase";
import "./PrivateRoute.css";

/**
 * Componente de Rota Privada
 * Protege rotas que requerem autenticação
 */
export function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  // Estado de loading com UI melhorada
  if (loading) {
    return (
      <div className="private-route-loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
        <p className="loading-text">Verificando autenticação...</p>
      </div>
    );
  }

  // Redireciona para login se não autenticado
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Renderiza o conteúdo protegido
  return children;
}
