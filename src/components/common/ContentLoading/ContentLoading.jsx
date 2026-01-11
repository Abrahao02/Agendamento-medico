import "./ContentLoading.css";

/**
 * Componente de Loading para Conteúdo
 * Usado dentro de cards, seções ou áreas específicas (não tela cheia)
 * 
 * @param {Object} props
 * @param {string} props.message - Mensagem customizada (opcional)
 * @param {number} props.height - Altura do container (opcional, padrão: 200px)
 * @param {boolean} props.inline - Se true, usa display inline-flex (opcional)
 * @param {string} props.size - Tamanho do spinner: 'sm', 'md', 'lg' (padrão: 'md')
 */
export default function ContentLoading({ 
  message = "Carregando...", 
  height = 200,
  inline = false,
  size = "md"
}) {
  return (
    <div 
      className={`content-loading ${inline ? 'inline' : ''}`}
      style={{ minHeight: `${height}px` }}
    >
      <div className="content-loading-wrapper">
        <div className={`content-spinner ${size}`}>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        {message && <p className="content-loading-text">{message}</p>}
      </div>
    </div>
  );
}