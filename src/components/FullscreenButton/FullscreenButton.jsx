// FullscreenButton.jsx
// Botão global reutilizável de tela cheia do GeekVerse G8.
// Usa a Fullscreen API do navegador.
// Aparece discreto no canto superior direito em todas as páginas.

import { useEffect, useState } from "react";
import "./FullscreenButton.css";

function FullscreenButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.warn("Não foi possível alterar o modo tela cheia:", error);
    }
  };

  return (
    <button
      type="button"
      className="fullscreen-button"
      onClick={handleFullscreen}
      aria-label={isFullscreen ? "Sair da tela cheia" : "Entrar em tela cheia"}
      title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
      id="global-fullscreen-toggle"
    >
      {isFullscreen ? "✕" : "⛶"}
    </button>
  );
}

export default FullscreenButton;
