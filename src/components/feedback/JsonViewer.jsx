// JsonViewer.jsx
// Componente para exibir JSON formatado com dados das APIs.
// Requisito obrigatório do professor para visualização de dados brutos.

import { useState } from 'react';

const JsonViewer = ({ data, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  return (
    <div className="gv-json-viewer">
      <button
        className="gv-json-toggle"
        onClick={() => setIsOpen(!isOpen)}
        id="json-viewer-toggle"
      >
        <span className="gv-json-toggle-icon">{isOpen ? '▼' : '▶'}</span>
        <span>{title || '📋 Dados da API (JSON)'}</span>
      </button>
      {isOpen && (
        <div className="gv-json-content">
          <pre className="gv-json-pre">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default JsonViewer;
