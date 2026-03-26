// Web Audio API sound effects for the blackjack trainer.
// All sounds are synthesized — no external files needed.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
  }
  // Resume if suspended (browsers require user gesture first)
  if (ctx.state === "suspended") {
    ctx.resume();
  }
  return ctx;
}

/** Short percussive noise burst — card sliding across felt */
export function playCardSlide() {
  triggerHaptic("light");
  try {
    const ac = getCtx();
    const duration = 0.08;
    const now = ac.currentTime;

    // Filtered noise burst
    const bufferSize = Math.round(ac.sampleRate * duration);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = ac.createBufferSource();
    source.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 3000;
    filter.Q.value = 0.8;

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    source.connect(filter).connect(gain).connect(ac.destination);
    source.start(now);
    source.stop(now + duration);
  } catch {
    // Audio not available — silently ignore
  }
}

/** Bright click — chip / correct answer */
export function playChipClick() {
  triggerHaptic("light");
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.06);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Audio not available
  }
}

/** Trigger haptic feedback on supported devices */
export function triggerHaptic(pattern: "light" | "error" = "light") {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      if (pattern === "error") {
        // Double pulse for wrong answer
        navigator.vibrate([40, 30, 40]);
      } else {
        navigator.vibrate(15);
      }
    }
  } catch {
    // Vibration API not available
  }
}

/** Low buzz — wrong answer */
export function playBuzz() {
  triggerHaptic("error");
  try {
    const ac = getCtx();
    const now = ac.currentTime;

    const osc = ac.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(150, now);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.setValueAtTime(0.1, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    // Audio not available
  }
}

/** Soft shuffle — shoe reshuffle */
export function playShuffle() {
  try {
    const ac = getCtx();
    const now = ac.currentTime;
    const duration = 0.4;

    const bufferSize = Math.round(ac.sampleRate * duration);
    const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = buffer.getChannelData(0);

    // Rippling noise pattern to simulate card riffle
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ac.sampleRate;
      const envelope = Math.sin(Math.PI * t / duration);
      const ripple = Math.sin(t * 120) * 0.3 + 0.7;
      data[i] = (Math.random() * 2 - 1) * envelope * ripple;
    }

    const source = ac.createBufferSource();
    source.buffer = buffer;

    const filter = ac.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2500;
    filter.Q.value = 0.5;

    const gain = ac.createGain();
    gain.gain.value = 0.08;

    source.connect(filter).connect(gain).connect(ac.destination);
    source.start(now);
    source.stop(now + duration);
  } catch {
    // Audio not available
  }
}
