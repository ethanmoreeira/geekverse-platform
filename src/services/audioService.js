import fugaIntroMusicFile from "../assets/audio/luis_humanoide-invasion-march-star-wars-style-cinematic-music-219585.mp3";
import fugaArenaMusicFile from "../assets/audio/leberch-countdown-suspense-254766.mp3";

let fugaIntroAudio = null;
let fugaArenaAudio = null;
let activeFugaAudio = "intro";
let fadeInterval = null;

function getIntroAudio() {
  if (!fugaIntroAudio) {
    fugaIntroAudio = new Audio(fugaIntroMusicFile);
    fugaIntroAudio.loop = true;
    fugaIntroAudio.volume = 0.35;
  }
  return fugaIntroAudio;
}

function getArenaAudio() {
  if (!fugaArenaAudio) {
    fugaArenaAudio = new Audio(fugaArenaMusicFile);
    fugaArenaAudio.loop = true;
    fugaArenaAudio.volume = 0.4;
  }
  return fugaArenaAudio;
}

export function playFugaMusic() {
  const audio = getIntroAudio();
  activeFugaAudio = "intro";
  audio.play().catch((error) => {
    console.warn("Áudio bloqueado pelo navegador até interação do usuário.", error);
  });
}

export function switchToFugaIntroMusic() {
  if (fadeInterval) clearInterval(fadeInterval);
  
  if (fugaArenaAudio) {
    fugaArenaAudio.pause();
    fugaArenaAudio.currentTime = 0;
  }

  const intro = getIntroAudio();
  activeFugaAudio = "intro";
  intro.volume = 0.35;
  intro.play().catch((error) => {
    console.warn("Áudio bloqueado pelo navegador até interação do usuário.", error);
  });
}

export function switchToFugaArenaMusic() {
  const intro = getIntroAudio();
  intro.pause();
  intro.currentTime = 0;

  const arena = getArenaAudio();
  activeFugaAudio = "arena";
  arena.play().catch((error) => {
    console.warn("Áudio bloqueado pelo navegador até interação do usuário.", error);
  });
}

export function toggleActiveFugaMusic() {
  const audio = activeFugaAudio === "arena" ? getArenaAudio() : getIntroAudio();

  if (audio.paused) {
    audio.play().catch((error) => {
      console.warn("Áudio bloqueado pelo navegador até interação do usuário.", error);
    });
  } else {
    audio.pause();
  }
}

export function stopAllFugaMusic() {
  // Limpar fade interval pendente
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }

  if (fugaIntroAudio) {
    fugaIntroAudio.pause();
    fugaIntroAudio.currentTime = 0;
  }

  if (fugaArenaAudio) {
    fugaArenaAudio.pause();
    fugaArenaAudio.currentTime = 0;
  }

  activeFugaAudio = "intro";
}
