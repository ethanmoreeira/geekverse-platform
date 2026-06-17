
// Painel recolhível com JSON formatado dos dados raw da API.

import { useState } from 'react';
import { FaCode, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const StarWarsJsonPanel = ({ starship, pilot, planet, vehicle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const jsonData = {
    nave: starship?.raw || null,
    piloto: pilot?.raw || null,
    planeta: planet?.raw || null,
    equipamento: vehicle?.raw || null,
  };

  // Não renderizar se nenhum dado selecionado
  const hasData = starship || pilot || planet || vehicle;
  if (!hasData) return null;

  return (
    <div className="sw-json-panel">
      <button
        className="sw-json-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        aria-expanded={isOpen}
        aria-controls="sw-json-content"
      >
        <FaCode />
        <span>JSON da API (dados reais da SWAPI)</span>
        {isOpen ? <FaChevronUp className="sw-json-toggle-icon" /> : <FaChevronDown className="sw-json-toggle-icon" />}
      </button>

      {isOpen && (
        <div className="sw-json-content" id="sw-json-content">
          <pre className="sw-json-pre">
            {JSON.stringify(jsonData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default StarWarsJsonPanel;
