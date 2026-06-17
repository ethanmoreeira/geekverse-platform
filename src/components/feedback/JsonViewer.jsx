import { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaClipboardList } from 'react-icons/fa';

const JsonViewer = ({ data, title, variant = 'global' }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  // Se for variant="smv" (Multiverso), usamos as classes do Multiverso (smv-*)
  // Se for "global", usamos as classes globais (gv-*)
  const isSmv = variant === 'smv';
  const prefix = isSmv ? 'smv-json' : 'gv-json';

  return (
    <div className={`${prefix}-viewer`}>
      <button
        className={`${prefix}-toggle`}
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        id={`json-viewer-toggle-${prefix}`}
      >
        {isSmv ? (
          <FaClipboardList aria-hidden="true" className="smv-icon" />
        ) : (
          <span className={`${prefix}-toggle-icon`}>{isOpen ? '▼' : '▶'}</span>
        )}
        
        <span>{title || ' Dados da API (JSON)'}</span>
        
        {isSmv && (
          isOpen ? (
            <FaChevronDown className={`${prefix}-toggle-icon`} />
          ) : (
            <FaChevronRight className={`${prefix}-toggle-icon`} />
          )
        )}
      </button>
      {isOpen && (
        <div className={`${prefix}-content`}>
          <pre className={`${prefix}-pre`}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default JsonViewer;
