const ACCESS_CODE = "yba3410";
let audioCtx = null;
let fallbackAnimationId = null;

// ==========================================
// BACKGROUND CANVAS PARTICLES SYSTEM
// ==========================================
function initParticleBackground() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const particles = [];
  const particleCount = 70;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1
    });
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${1 - dist / 130 * 0.85})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(animateParticles);
  }

  animateParticles();
}

window.addEventListener('DOMContentLoaded', initParticleBackground);

// ==========================================
// AUDIO SYNTHESIZER
// ==========================================
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

document.addEventListener('click', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });

function playBeep(freq = 800, type = 'sine', duration = 0.1) {
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function playAlarmSound() {
  try {
    initAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } catch (e) {}
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
  }
}

function addLog(msg) {
  const container = document.getElementById('system-logs');
  const entry = document.createElement('div');
  entry.className = 'log-entry';
  const time = new Date().toLocaleTimeString().split(' ')[0];
  entry.innerHTML = `<span class="log-time">[${time}]</span> ${msg}`;
  container.appendChild(entry);
  if (container.children.length > 5) {
    container.removeChild(container.firstChild);
  }
}

function authenticate() {
  initAudio();
  const input = document.getElementById('access-code').value.trim();
  const errorElement = document.getElementById('auth-error');

  if (input === ACCESS_CODE) {
    errorElement.style.display = 'none';
    playBeep(1200, 'triangle', 0.2);
    addLog("ACCESS GRANTED: ADMIN");
    switchPhase('phase-scan');
    startScanning();
  } else {
    errorElement.style.display = 'block';
    playAlarmSound();
    addLog("ACCESS DENIED: INVALID KEY");
    const inputEl = document.getElementById('access-code');
    inputEl.value = '';
    inputEl.focus();
  }
}

document.getElementById('access-code').addEventListener('keypress', function(e) {
  if (e.key === 'Enter') authenticate();
});

function switchPhase(phaseId) {
  document.querySelectorAll('.phase').forEach(p => p.classList.remove('active'));
  document.getElementById(phaseId).classList.add('active');
  
  const statusEl = document.getElementById('sys-status');
  if (phaseId === 'phase-scan') statusEl.innerText = 'AUTHENTICATING & SCANNING';
  if (phaseId === 'phase-countdown') statusEl.innerText = 'COUNTDOWN IN PROGRESS';
  if (phaseId === 'phase-video') statusEl.innerText = 'LAUNCH PROCEDURE ACTIVE';
}

function startScanning() {
  const progressBar = document.getElementById('progress-bar');
  const scanDetails = document.getElementById('scan-details');
  let progress = 0;

  const logs = [
    "INITIALIZING SYSTEM MODULES...",
    "VERIFYING SK SUNGAI BAYAN CREDENTIALS...",
    "CONNECTING TO MUKAH SERVER NODE...",
    "ENCRYPTING DATA CHANNEL...",
    "PREPARING LAUNCH MATRIX...",
    "SYSTEM VERIFIED & READY."
  ];

  const interval = setInterval(() => {
    progress += 2;
    progressBar.style.width = progress + '%';
    
    if (progress % 15 === 0) playBeep(600 + progress * 5, 'sine', 0.05);

    const logIndex = Math.min(Math.floor((progress / 100) * logs.length), logs.length - 1);
    scanDetails.innerText = logs[logIndex];
    if (progress % 20 === 0) addLog(logs[logIndex]);

    if (progress >= 100) {
      clearInterval(interval);
      playBeep(1500, 'square', 0.3);
      setTimeout(() => {
        switchPhase('phase-countdown');
        startCountdown();
      }, 500);
    }
  }, 40);
}

function startCountdown() {
  let count = 5;
  const countEl = document.getElementById('countdown-num');

  const timer = setInterval(() => {
    countEl.innerText = count;
    playBeep(1000 + (6 - count) * 200, 'triangle', 0.15);
    addLog(`COUNTDOWN: ${count}`);
    
    count--;
    if (count < 0) {
      clearInterval(timer);
      playBeep(2000, 'sawtooth', 0.5);
      switchPhase('phase-video');
      playLaunchVideo();
    }
  }, 1000);
}

function playLaunchVideo() {
  const video = document.getElementById('launch-video');
  const fallbackCanvas = document.getElementById('fallback-canvas');
  const controls = document.getElementById('video-controls');
  
  controls.style.display = 'none';

  const playPromise = video.play();

  if (playPromise !== undefined) {
    playPromise.then(() => {
      video.style.display = 'block';
      fallbackCanvas.style.display = 'none';
      
      video.onended = () => {
        controls.style.display = 'flex';
      };
    }).catch(error => {
      console.log("Video not found/blocked. Using Fallback Canvas.", error);
      video.style.display = 'none';
      fallbackCanvas.style.display = 'block';
      startFallbackAnimation(controls);
    });
  }
}

function startFallbackAnimation(controls) {
  const canvas = document.getElementById('fallback-canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let frame = 0;
  const maxFrames = 300;

  function draw() {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, (frame * 3 + i * 40) % (canvas.width / 2), 0, Math.PI * 2);
      ctx.strokeStyle = i % 2 === 0 ? '#00f0ff' : '#ffe600';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.font = 'bold 3rem Orbitron, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 20;
    ctx.fillText("SK SUNGAI BAYAN", cx, cy - 20);

    ctx.font = 'bold 1.8rem Orbitron, sans-serif';
    ctx.fillStyle = '#ffe600';
    ctx.fillText("RASMI DILANCARKAN!", cx, cy + 40);

    frame++;
    if (frame < maxFrames) {
      fallbackAnimationId = requestAnimationFrame(draw);
    } else {
      controls.style.display = 'flex';
    }
  }

  draw();
}

function resetSystem() {
  if (fallbackAnimationId) cancelAnimationFrame(fallbackAnimationId);
  
  const video = document.getElementById('launch-video');
  video.pause();
  video.currentTime = 0;
  
  document.getElementById('access-code').value = '';
  document.getElementById('video-controls').style.display = 'none';
  document.getElementById('sys-status').innerText = 'STANDBY FOR ACCESS CODE';
  
  addLog("SYSTEM RESET COMPLETE");
  switchPhase('phase-auth');
}