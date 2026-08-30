// --- AUDIO ENGINE (Synthesizer via Web Audio API) ---
class AudioEngine {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  playTone(freq, waveType = 'sine', duration = 0.8) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = waveType;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

const audio = new AudioEngine();

// Keyboard note frequencies (Pentatonic-friendly mapping)
const keyFrequencies = {
  a: 220.00, s: 246.94, d: 277.18, f: 329.63, g: 369.99,
  h: 440.00, j: 493.88, k: 554.37, l: 659.25, w: 293.66,
  e: 329.63, r: 392.00, t: 440.00, y: 523.25, u: 587.33,
  i: 659.25, o: 783.99, p: 880.00, z: 130.81, x: 146.83,
  c: 164.81, v: 196.00, b: 220.00, n: 246.94, m: 261.63
};

// --- THREE.JS SCENE SETUP ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 3000);
camera.position.z = 800;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);

// --- GALAXY PARTICLES ---
const PARTICLE_COUNT = 8000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(PARTICLE_COUNT * 3);
const colors = new Float32Array(PARTICLE_COUNT * 3);

const colorThemes = [
  [new THREE.Color('#00f2fe'), new THREE.Color('#4facfe'), new THREE.Color('#6b11ff')],
  [new THREE.Color('#ff0844'), new THREE.Color('#ffb199'), new THREE.Color('#f76b1c')],
  [new THREE.Color('#00ff87'), new THREE.Color('#60efff'), new THREE.Color('#0061ff')]
];
let currentThemeIndex = 0;

function generateGalaxy(themeIndex) {
  const currentTheme = colorThemes[themeIndex];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    const radius = Math.random() * 1200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i3 + 2] = radius * Math.cos(phi);

    const pickedColor = currentTheme[Math.floor(Math.random() * currentTheme.length)];
    colors[i3] = pickedColor.r;
    colors[i3 + 1] = pickedColor.g;
    colors[i3 + 2] = pickedColor.b;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}
generateGalaxy(currentThemeIndex);

const particleMaterial = new THREE.PointsMaterial({
  size: 3.5,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  blending: THREE.AdditiveBlending
});

const particleSystem = new THREE.Points(geometry, particleMaterial);
scene.add(particleSystem);

// --- EXPANDING SHOCKWAVE RINGS ---
const shockwaves = [];
function createShockwave(x = 0, y = 0) {
  const ringGeo = new THREE.RingGeometry(5, 12, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: colorThemes[currentThemeIndex][0],
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.set(x, y, 200);
  scene.add(ring);
  shockwaves.push({ mesh: ring, scale: 1, opacity: 0.9 });
}

// --- INTERACTION & CONTROLS ---
let warpSpeed = false;
let rotationSpeed = 0.001;
const keyDisplay = document.getElementById('key-display');

function triggerPulse(label, freq) {
  audio.playTone(freq, 'triangle', 0.9);
  createShockwave(
    (Math.random() - 0.5) * 400,
    (Math.random() - 0.5) * 400
  );

  keyDisplay.textContent = label.toUpperCase();
  keyDisplay.classList.add('active');
  setTimeout(() => keyDisplay.classList.remove('active'), 200);

  particleMaterial.size = 6.0;
  setTimeout(() => { particleMaterial.size = 3.5; }, 100);
}

window.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  const freq = keyFrequencies[key] || (200 + Math.random() * 600);
  triggerPulse(key, freq);
});

window.addEventListener('pointerdown', (e) => {
  const normX = (e.clientX / window.innerWidth) * 2 - 1;
  const normY = -(e.clientY / window.innerHeight) * 2 + 1;
  const freq = 200 + Math.random() * 500;
  triggerPulse('CLICK', freq);
  createShockwave(normX * 300, normY * 300);
});

// Mouse parallax
let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX - window.innerWidth / 2) * 0.15;
  mouseY = (e.clientY - window.innerHeight / 2) * 0.15;
});

// UI Buttons
document.getElementById('btn-theme').addEventListener('click', (e) => {
  e.stopPropagation();
  currentThemeIndex = (currentThemeIndex + 1) % colorThemes.length;
  generateGalaxy(currentThemeIndex);
  geometry.attributes.color.needsUpdate = true;
});

document.getElementById('btn-warp').addEventListener('click', (e) => {
  e.stopPropagation();
  warpSpeed = !warpSpeed;
  e.target.textContent = warpSpeed ? 'Normal Speed' : 'Toggle Warp Speed';
});

// --- ANIMATION LOOP ---
function animate() {
  requestAnimationFrame(animate);

  const deltaSpeed = warpSpeed ? 0.015 : rotationSpeed;
  particleSystem.rotation.y += deltaSpeed;
  particleSystem.rotation.x += deltaSpeed * 0.5;

  // Smooth camera easing
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  // Update Shockwaves
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i];
    sw.scale += 8;
    sw.opacity -= 0.02;
    sw.mesh.scale.set(sw.scale, sw.scale, 1);
    sw.mesh.material.opacity = sw.opacity;

    if (sw.opacity <= 0) {
      scene.remove(sw.mesh);
      sw.mesh.geometry.dispose();
      sw.mesh.material.dispose();
      shockwaves.splice(i, 1);
    }
  }

  renderer.render(scene, camera);
}

// Window resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
