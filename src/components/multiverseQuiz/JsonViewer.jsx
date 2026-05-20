// JsonViewer.jsx
// Painel colapsável para JSON formatado das respostas da API.
// Reutiliza o estilo do GeekVerse (gv-json-*) para manter consistência.

import { useState } from 'react';
import { FaCode, FaChevronDown, FaChevronRight, FaClipboardList } from 'react-icons/fa';

const JsonViewer = ({ data, title = 'Dados da API (JSON)' }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  return (
    <div className="smv-json-viewer">
      <button
        className="smv-json-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        id="json-viewer-toggle-smv"
      >
        <FaClipboardList aria-hidden="true" className="smv-icon" />
        <span>{title}</span>
        {isOpen ? (
          <FaChevronDown className="smv-json-toggle-icon" />
        ) : (
          <FaChevronRight className="smv-json-toggle-icon" />
        )}
      </button>
      {isOpen && (
        <div className="smv-json-content">
          <pre className="smv-json-pre">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default JsonViewer;
