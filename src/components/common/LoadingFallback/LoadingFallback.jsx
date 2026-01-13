import "./LoadingFallback.css";

/**
 * Componente de Loading para Lazy Loading
 * Aparece enquanto os componentes estão sendo carregados
 */
export default function LoadingFallback() {
  return (
    <div className="loading-fallback">
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
        </div>
        <h2 className="loading-title">Carregando...</h2>
        <p className="loading-subtitle">Aguarde um momento</p>
      </div>
    </div>
  );
}
