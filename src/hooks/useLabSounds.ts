import { useCallback, useRef } from "react";

// Sound effect URLs - using Web Audio API for generated sounds
type SoundType = 
  | "bubbling" 
  | "explosion" 
  | "glass_break" 
  | "pour" 
  | "sizzle" 
  | "gas_release" 
  | "fire_start" 
  | "fire_loop"
  | "warning_alarm"
  | "success"
  | "click"
  | "equip"
  | "pendulum_swing"
  | "electrical_spark"
  | "projectile_launch"
  | "microscope_focus"
  | "slide_click"
  | "circuit_power";

export function useLabSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<Map<string, OscillatorNode>>(new Map());

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playBubbling = useCallback((duration: number = 2) => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(400, ctx.currentTime);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    
    // Modulate for bubbling effect
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.setValueAtTime(8, ctx.currentTime);
    lfoGain.gain.setValueAtTime(100, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(oscillator.frequency);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    lfo.start();
    oscillator.start();
    
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    setTimeout(() => {
      oscillator.stop();
      lfo.stop();
    }, duration * 1000);
  }, [getAudioContext]);

  const playExplosion = useCallback(() => {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Generate explosion noise
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.1));
      data[i] = (Math.random() * 2 - 1) * decay;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.8, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(1000, ctx.currentTime);
    lowpass.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);

    source.connect(lowpass);
    lowpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    source.start();

    // Add low boom
    const boom = ctx.createOscillator();
    const boomGain = ctx.createGain();
    boom.type = "sine";
    boom.frequency.setValueAtTime(60, ctx.currentTime);
    boom.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.3);
    boomGain.gain.setValueAtTime(0.5, ctx.currentTime);
    boomGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    boom.connect(boomGain);
    boomGain.connect(ctx.destination);
    boom.start();
    boom.stop(ctx.currentTime + 0.4);
  }, [getAudioContext]);

  const playGlassBreak = useCallback(() => {
    const ctx = getAudioContext();
    
    // High-pitched crack sound
    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crack.type = "square";
    crack.frequency.setValueAtTime(2000, ctx.currentTime);
    crack.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
    crackGain.gain.setValueAtTime(0.3, ctx.currentTime);
    crackGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    crack.connect(crackGain);
    crackGain.connect(ctx.destination);
    crack.start();
    crack.stop(ctx.currentTime + 0.15);

    // Shatter noise
    const bufferSize = ctx.sampleRate * 0.3;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.15));
      data[i] = (Math.random() * 2 - 1) * decay * 0.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(2000, ctx.currentTime);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    source.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(ctx.currentTime + 0.02);
  }, [getAudioContext]);

  const playPour = useCallback((duration: number = 1) => {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate;
      // Flowing water sound
      data[i] = (Math.random() * 2 - 1) * 0.3 * 
                (1 + Math.sin(t * 50) * 0.5) *
                Math.min(1, t * 4) * Math.min(1, (duration - t) * 4);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(3000, ctx.currentTime);
    bandpass.Q.setValueAtTime(2, ctx.currentTime);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    source.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  }, [getAudioContext]);

  const playSizzle = useCallback((duration: number = 1.5) => {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const decay = Math.exp(-i / (bufferSize * 0.5));
      data[i] = (Math.random() * 2 - 1) * decay * 0.4;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(4000, ctx.currentTime);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
    source.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  }, [getAudioContext]);

  const playGasRelease = useCallback((duration: number = 2) => {
    const ctx = getAudioContext();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * 0.3 * 
                (1 - t * 0.5) * // gradual fade
                (1 + Math.sin(i / 100) * 0.3);
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(500, ctx.currentTime);
    bandpass.Q.setValueAtTime(1, ctx.currentTime);
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    source.connect(bandpass);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
  }, [getAudioContext]);

  const playFireStart = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(100, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  }, [getAudioContext]);

  const playWarningAlarm = useCallback(() => {
    const ctx = getAudioContext();
    
    for (let i = 0; i < 3; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + i * 0.3);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.3);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.3 + 0.05);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + i * 0.3 + 0.15);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime + i * 0.3);
      oscillator.stop(ctx.currentTime + i * 0.3 + 0.2);
    }
  }, [getAudioContext]);

  const playSuccess = useCallback(() => {
    const ctx = getAudioContext();
    
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.1);
      gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.1 + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.1 + 0.3);
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.start(ctx.currentTime + i * 0.1);
      oscillator.stop(ctx.currentTime + i * 0.1 + 0.4);
    });
  }, [getAudioContext]);

  const playClick = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  }, [getAudioContext]);

  const playEquip = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
  }, [getAudioContext]);

  // New physics-related sounds
  const playPendulumSwing = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(180, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.3);
  }, [getAudioContext]);

  const playElectricalSpark = useCallback(() => {
    const ctx = getAudioContext();
    
    // Create crackling noise
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Random crackles
      const isCrackle = Math.random() > 0.95;
      data[i] = isCrackle ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.1;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.setValueAtTime(2000, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    source.connect(highpass);
    highpass.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    
    // Add buzz
    const buzz = ctx.createOscillator();
    const buzzGain = ctx.createGain();
    buzz.type = "sawtooth";
    buzz.frequency.setValueAtTime(60, ctx.currentTime);
    buzzGain.gain.setValueAtTime(0.15, ctx.currentTime);
    buzzGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    buzz.connect(buzzGain);
    buzzGain.connect(ctx.destination);
    buzz.start();
    buzz.stop(ctx.currentTime + 0.15);
  }, [getAudioContext]);

  const playProjectileLaunch = useCallback(() => {
    const ctx = getAudioContext();
    
    // Whoosh sound
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      data[i] = (Math.random() * 2 - 1) * Math.sin(t * Math.PI) * 0.4;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(500, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 0.2);
    filter.Q.setValueAtTime(2, ctx.currentTime);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start();
    
    // Thump sound
    const thump = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(80, ctx.currentTime);
    thump.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.1);
    thumpGain.gain.setValueAtTime(0.3, ctx.currentTime);
    thumpGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    thump.connect(thumpGain);
    thumpGain.connect(ctx.destination);
    thump.start();
    thump.stop(ctx.currentTime + 0.1);
  }, [getAudioContext]);

  const playMicroscopeFocus = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(300, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.1);
    oscillator.frequency.linearRampToValueAtTime(350, ctx.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.2);
  }, [getAudioContext]);

  const playSlideClick = useCallback(() => {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(2000, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.02);
    
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.05);
  }, [getAudioContext]);

  const playCircuitPower = useCallback(() => {
    const ctx = getAudioContext();
    
    // Hum sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(60, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.5);
    
    // Click sound
    const click = ctx.createOscillator();
    const clickGain = ctx.createGain();
    click.type = "square";
    click.frequency.setValueAtTime(1500, ctx.currentTime);
    clickGain.gain.setValueAtTime(0.2, ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.03);
    click.connect(clickGain);
    clickGain.connect(ctx.destination);
    click.start();
    click.stop(ctx.currentTime + 0.03);
  }, [getAudioContext]);

  const playSound = useCallback((type: SoundType, options?: { duration?: number }) => {
    switch (type) {
      case "bubbling":
        playBubbling(options?.duration);
        break;
      case "explosion":
        playExplosion();
        break;
      case "glass_break":
        playGlassBreak();
        break;
      case "pour":
        playPour(options?.duration);
        break;
      case "sizzle":
        playSizzle(options?.duration);
        break;
      case "gas_release":
        playGasRelease(options?.duration);
        break;
      case "fire_start":
        playFireStart();
        break;
      case "warning_alarm":
        playWarningAlarm();
        break;
      case "success":
        playSuccess();
        break;
      case "click":
        playClick();
        break;
      case "equip":
        playEquip();
        break;
      case "pendulum_swing":
        playPendulumSwing();
        break;
      case "electrical_spark":
        playElectricalSpark();
        break;
      case "projectile_launch":
        playProjectileLaunch();
        break;
      case "microscope_focus":
        playMicroscopeFocus();
        break;
      case "slide_click":
        playSlideClick();
        break;
      case "circuit_power":
        playCircuitPower();
        break;
    }
  }, [playBubbling, playExplosion, playGlassBreak, playPour, playSizzle, playGasRelease, playFireStart, playWarningAlarm, playSuccess, playClick, playEquip, playPendulumSwing, playElectricalSpark, playProjectileLaunch, playMicroscopeFocus, playSlideClick, playCircuitPower]);

  const stopAllSounds = useCallback(() => {
    activeOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    activeOscillatorsRef.current.clear();
  }, []);

  return {
    playSound,
    stopAllSounds,
    playBubbling,
    playExplosion,
    playGlassBreak,
    playPour,
    playSizzle,
    playGasRelease,
    playFireStart,
    playWarningAlarm,
    playSuccess,
    playClick,
    playEquip,
    playPendulumSwing,
    playElectricalSpark,
    playProjectileLaunch,
    playMicroscopeFocus,
    playSlideClick,
    playCircuitPower,
  };
}
