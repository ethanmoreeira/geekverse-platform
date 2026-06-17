import { useState, useEffect, useRef } from 'react';
import fugaIntroMusicFile from '../../assets/audio/luis_humanoide-invasion-march-star-wars-style-cinematic-music-219585.mp3';
import fugaArenaMusicFile from '../../assets/audio/leberch-countdown-suspense-254766.mp3';

export const useHyperdriveMusic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrack, setActiveTrack] = useState('intro');
  const userMutedRef = useRef(false);
  const introAudioRef = useRef(null);
  const arenaAudioRef = useRef(null);

  useEffect(() => {
    // Initialize intro audio
    const introAudio = new Audio(fugaIntroMusicFile);
    introAudio.loop = true;
    introAudio.volume = 0.35;
    introAudioRef.current = introAudio;

    // Initialize arena audio
    const arenaAudio = new Audio(fugaArenaMusicFile);
    arenaAudio.loop = true;
    arenaAudio.volume = 0.4;
    arenaAudioRef.current = arenaAudio;

    const playPromise = introAudio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('[Hyperdrive] Autoplay bloqueado pelo navegador:', err);
          setIsPlaying(false);
        });
    }

    return () => {
      if (introAudioRef.current) {
        introAudioRef.current.pause();
        introAudioRef.current.currentTime = 0;
        introAudioRef.current = null;
      }
      if (arenaAudioRef.current) {
        arenaAudioRef.current.pause();
        arenaAudioRef.current.currentTime = 0;
        arenaAudioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    const audio = activeTrack === 'arena' ? arenaAudioRef.current : introAudioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      userMutedRef.current = true;
    } else {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          userMutedRef.current = false;
        })
        .catch((err) => console.warn('[Hyperdrive] Erro ao tocar música:', err.message));
    }
  };

  const switchToArenaMusic = () => {
    if (introAudioRef.current) {
      introAudioRef.current.pause();
      introAudioRef.current.currentTime = 0;
    }
    setActiveTrack('arena');
    if (!userMutedRef.current && arenaAudioRef.current) {
      arenaAudioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const switchToIntroMusic = () => {
    if (arenaAudioRef.current) {
      arenaAudioRef.current.pause();
      arenaAudioRef.current.currentTime = 0;
    }
    setActiveTrack('intro');
    if (!userMutedRef.current && introAudioRef.current) {
      introAudioRef.current.volume = 0.35;
      introAudioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const stopMusic = () => {
    if (introAudioRef.current) {
      introAudioRef.current.pause();
      introAudioRef.current.currentTime = 0;
    }
    if (arenaAudioRef.current) {
      arenaAudioRef.current.pause();
      arenaAudioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  return { isPlaying, toggleMusic, switchToArenaMusic, switchToIntroMusic, stopMusic };
};
