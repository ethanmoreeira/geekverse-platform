import { useState, useEffect, useRef } from 'react';

const DEADZONE = 0.18;

const normalizeAxis = (val) => {
  if (Math.abs(val) < DEADZONE) return 0;
  return val;
};

// Persistência em nível de módulo para sobreviver ao unmount da arena
let lastKnownGamepadIndex = null;

export const useGamepadControls = () => {
  const [connected, setConnected] = useState(false);
  const [gamepadName, setGamepadName] = useState('');
  
  const gamepadInputRef = useRef({
    moveX: 0,
    moveY: 0,
    confirmPressed: false,
    cancelPressed: false,
    pausePressed: false
  });

  const frameRef = useRef(null);

  useEffect(() => {
    if (!navigator || typeof navigator.getGamepads !== 'function') {
      return;
    }

    const updateGamepadState = () => {
      const gamepads = navigator.getGamepads();
      if (!gamepads) return;

      let gp = null;
      if (lastKnownGamepadIndex !== null && gamepads[lastKnownGamepadIndex]?.connected) {
        gp = gamepads[lastKnownGamepadIndex];
      } else {
        gp = Array.from(gamepads).find(pad => pad && pad.connected);
        if (gp) {
          lastKnownGamepadIndex = gp.index;
        }
      }

      if (gp) {
        gamepadInputRef.current.moveX = normalizeAxis(gp.axes[0] || 0);
        gamepadInputRef.current.moveY = normalizeAxis(gp.axes[1] || 0);
        
        gamepadInputRef.current.confirmPressed = gp.buttons[0]?.pressed || false;
        gamepadInputRef.current.cancelPressed = gp.buttons[1]?.pressed || false;
        gamepadInputRef.current.pausePressed = gp.buttons[9]?.pressed || false;
      } else {
        gamepadInputRef.current.moveX = 0;
        gamepadInputRef.current.moveY = 0;
        gamepadInputRef.current.confirmPressed = false;
        gamepadInputRef.current.cancelPressed = false;
        gamepadInputRef.current.pausePressed = false;
      }

      frameRef.current = requestAnimationFrame(updateGamepadState);
    };

    const rescanGamepads = () => {
      const gamepads = navigator.getGamepads();
      let gp = null;

      if (lastKnownGamepadIndex !== null && gamepads[lastKnownGamepadIndex]?.connected) {
        gp = gamepads[lastKnownGamepadIndex];
      } else {
        gp = Array.from(gamepads).find(pad => pad && pad.connected);
      }

      if (gp) {
        lastKnownGamepadIndex = gp.index;
        setConnected(true);
        setGamepadName(gp.id);
        if (!frameRef.current) {
          frameRef.current = requestAnimationFrame(updateGamepadState);
        }
      }
    };

    const onGamepadConnected = (e) => {
      console.log('Gamepad connected:', e.gamepad.id);
      lastKnownGamepadIndex = e.gamepad.index;
      rescanGamepads();
    };

    const onGamepadDisconnected = (e) => {
      console.log('Gamepad disconnected:', e.gamepad.id);
      if (lastKnownGamepadIndex === e.gamepad.index) {
        lastKnownGamepadIndex = null;
      }
      
      const gamepads = navigator.getGamepads();
      const stillConnected = Array.from(gamepads).find(pad => pad && pad.connected);

      if (!stillConnected) {
        setConnected(false);
        setGamepadName('');
        gamepadInputRef.current.moveX = 0;
        gamepadInputRef.current.moveY = 0;
        gamepadInputRef.current.confirmPressed = false;
        gamepadInputRef.current.cancelPressed = false;
        gamepadInputRef.current.pausePressed = false;
        if (frameRef.current) {
          cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
      } else {
        lastKnownGamepadIndex = stillConnected.index;
        setGamepadName(stillConnected.id);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        rescanGamepads();
      }
    };

    const onFocus = () => {
      rescanGamepads();
    };

    window.addEventListener('gamepadconnected', onGamepadConnected);
    window.addEventListener('gamepaddisconnected', onGamepadDisconnected);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    // Initial scan to catch already connected gamepads
    rescanGamepads();

    return () => {
      window.removeEventListener('gamepadconnected', onGamepadConnected);
      window.removeEventListener('gamepaddisconnected', onGamepadDisconnected);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  return { connected, gamepadName, gamepadInputRef };
};
