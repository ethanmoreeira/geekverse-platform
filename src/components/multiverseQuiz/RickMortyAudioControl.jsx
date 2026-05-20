// RickMortyAudioControl.jsx
// Controle de áudio do Show do Multiverso.
// Padrão idêntico ao Harry Potter: botão toggle Pausar/Tocar.
// Props: audioRef, isMusicPlaying, onToggle

import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';

const RickMortyAudioControl = ({ isMusicPlaying, onToggle }) => {
  return (
    <button
      className={`smv-audio-control ${isMusicPlaying ? 'smv-audio-control-active' : 'smv-audio-control-muted'}`}
      onClick={onToggle}
      type="button"
      aria-label={isMusicPlaying ? 'Pausar música ambiente' : 'Tocar música ambiente'}
      id="smv-audio-toggle"
    >
      {isMusicPlaying ? (
        <>
          <FaVolumeUp aria-hidden="true" className="smv-audio-icon" />
          <span>Pausar</span>
        </>
      ) : (
        <>
          <FaVolumeMute aria-hidden="true" className="smv-audio-icon" />
          <span>Tocar</span>
        </>
      )}
    </button>
  );
};

export default RickMortyAudioControl;
