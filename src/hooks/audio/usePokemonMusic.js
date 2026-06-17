import { useState, useEffect, useRef } from 'react';
import musicFile from '../../assets/audio/moodmode-labyrinth-of-despair-166594.mp3';

export const usePokemonMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Inicializa o audio
    const audio = new Audio(musicFile);
    audio.loop = true;
    audio.volume = 0.22; // Volume agradavel entre 0.18 e 0.28
    audioRef.current = audio;

    // Tenta autoplay ao montar o jogo (usuario clicou no dashboard antes)
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn('Autoplay bloqueado pelo navegador:', err);
          setIsPlaying(false);
        });
    }

    // Cleanup: pausa e reseta ao desmontar o jogo
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Erro ao tocar música:', err));
    }
  };

  return { isPlaying, toggleMusic };
};
