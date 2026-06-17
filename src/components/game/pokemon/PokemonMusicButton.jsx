import { FaPlay, FaPause } from 'react-icons/fa';

const PokemonMusicButton = ({ isPlaying, onToggle }) => {
  return (
    <button
      className="pks-music-btn"
      onClick={onToggle}
      type="button"
      title={isPlaying ? 'Pausar Música' : 'Tocar Música'}
    >
      {isPlaying ? <FaPause /> : <FaPlay />}
      <span>{isPlaying ? 'Pausar' : 'Tocar'}</span>
    </button>
  );
};

export default PokemonMusicButton;
