const canvas = document.getElementById('holograma');
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(140, 140);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(2, 3, 6);
camera.lookAt(0, 1, 0);

// ── Luces ──
scene.add(new THREE.AmbientLight(0x00ffcc, 0.4));
const dirLight = new THREE.DirectionalLight(0xffffff, 1.3);
dirLight.position.set(4, 6, 4);
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0x0088ff, 0.3);
fillLight.position.set(-3, 2, -2);
scene.add(fillLight);
const rimLight = new THREE.DirectionalLight(0x00ffcc, 0.5);
rimLight.position.set(0, -2, -4);
scene.add(rimLight);

// ── Materiales ──
const matRojo = new THREE.MeshStandardMaterial({
  color: 0xcc2200,
  emissive: 0x220000,
  metalness: 0.2,
  roughness: 0.5,
  transparent: true,
  opacity: 0.92
});

const matPlata = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  emissive: 0x111111,
  metalness: 0.85,
  roughness: 0.2,
  transparent: true,
  opacity: 0.95
});

const matLED = new THREE.MeshStandardMaterial({
  color: 0x4488ff,
  emissive: 0x2244ff,
  emissiveIntensity: 1.5,
  transparent: true,
  opacity: 0.9
});

const matServo = new THREE.MeshStandardMaterial({
  color: 0xeeeeee,
  metalness: 0.1,
  roughness: 0.6,
  transparent: true,
  opacity: 0.9
});

const matCable = new THREE.MeshStandardMaterial({
  color: 0x888888,
  metalness: 0.7,
  roughness: 0.3,
  transparent: true,
  opacity: 0.85
});

const grupo = new THREE.Group();

// ── BASE cilíndrica grande ──
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(0.7, 0.75, 1.1, 32),
  matRojo
);
base.position.y = 0.55;
grupo.add(base);

// Tapa inferior base
const tapaBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.72, 0.72, 0.05, 32),
  matPlata
);
tapaBase.position.y = 0.02;
grupo.add(tapaBase);

// ── CUERPO PRINCIPAL rectangular con esquinas redondeadas ──
// Cuerpo central (caja principal)
const cuerpo = new THREE.Mesh(
  new THREE.BoxGeometry(1.1, 0.9, 0.85),
  matRojo
);
cuerpo.position.set(0.15, 1.55, 0);
grupo.add(cuerpo);

// Tapa superior redondeada del cuerpo
const tapaCuerpo = new THREE.Mesh(
  new THREE.CylinderGeometry(0.44, 0.44, 0.1, 32),
  matRojo
);
tapaCuerpo.rotation.z = Math.PI / 2;
tapaCuerpo.position.set(0.15, 1.98, 0);
grupo.add(tapaCuerpo);

// ── ARO METÁLICO central (articulación con LED azul) ──
const aroExt = new THREE.Mesh(
  new THREE.TorusGeometry(0.6, 0.06, 16, 48),
  matPlata
);
aroExt.position.set(0, 1.1, 0);
aroExt.rotation.x = Math.PI / 2;
grupo.add(aroExt);

// LED azul (aro interior)
const aroLED = new THREE.Mesh(
  new THREE.TorusGeometry(0.52, 0.035, 12, 48),
  matLED
);
aroLED.position.set(0, 1.1, 0);
aroLED.rotation.x = Math.PI / 2;
grupo.add(aroLED);

// ── BRAZO secundario cilíndrico ──
const brazo = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.45, 0.95, 32),
  matRojo
);
brazo.position.set(0, 0.52, 0.88);
brazo.rotation.x = Math.PI / 2;
grupo.add(brazo);

// Tapa brazo
const tapaBrazo = new THREE.Mesh(
  new THREE.CylinderGeometry(0.42, 0.42, 0.05, 32),
  matPlata
);
tapaBrazo.position.set(0, 0.52, 1.37);
tapaBrazo.rotation.x = Math.PI / 2;
grupo.add(tapaBrazo);

// ── EJE Z — husillo helicoidal ──
const husilloBase = new THREE.Mesh(
  new THREE.CylinderGeometry(0.07, 0.07, 1.2, 12),
  matPlata
);
husilloBase.position.set(0.7, 0.8, 0.65);
grupo.add(husilloBase);

// Espiras del husillo (apiladas)
for (let i = 0; i < 9; i++) {
  const espira = new THREE.Mesh(
    new THREE.TorusGeometry(0.13, 0.03, 8, 24),
    matPlata
  );
  espira.position.set(0.7, 0.25 + i * 0.12, 0.65);
  espira.rotation.x = Math.PI / 2;
  grupo.add(espira);
}

// Guía lateral del husillo
const guia = new THREE.Mesh(
  new THREE.BoxGeometry(0.06, 1.2, 0.06),
  matPlata
);
guia.position.set(0.85, 0.8, 0.65);
grupo.add(guia);

// ── SERVO (efector final) ──
const servoBody = new THREE.Mesh(
  new THREE.BoxGeometry(0.28, 0.22, 0.32),
  matServo
);
servoBody.position.set(0.7, 0.18, 0.65);
grupo.add(servoBody);

// Rueda del servo
const ruedaServo = new THREE.Mesh(
  new THREE.CylinderGeometry(0.08, 0.08, 0.05, 16),
  matPlata
);
ruedaServo.position.set(0.58, 0.18, 0.65);
ruedaServo.rotation.z = Math.PI / 2;
grupo.add(ruedaServo);

// ── CABLES trenzados ──
function crearCable(puntos, radio) {
  const curve = new THREE.CatmullRomCurve3(puntos);
  const geometry = new THREE.TubeGeometry(curve, 20, radio, 8, false);
  return new THREE.Mesh(geometry, matCable);
}

// Cable principal izquierdo
const cable1 = crearCable([
  new THREE.Vector3(-0.5, 0.8, 0.2),
  new THREE.Vector3(-0.7, 0.5, 0.3),
  new THREE.Vector3(-0.6, 0.2, 0.5),
  new THREE.Vector3(-0.4, 0.0, 0.7),
], 0.035);
grupo.add(cable1);

// Cable derecho hacia husillo
const cable2 = crearCable([
  new THREE.Vector3(0.3, 1.0, 0.3),
  new THREE.Vector3(0.5, 0.7, 0.5),
  new THREE.Vector3(0.65, 0.4, 0.6),
], 0.032);
grupo.add(cable2);

// Cable del servo
const cable3 = crearCable([
  new THREE.Vector3(0.7, 0.18, 0.82),
  new THREE.Vector3(0.6, 0.1, 1.0),
  new THREE.Vector3(0.5, 0.0, 1.1),
], 0.025);
grupo.add(cable3);

// ── Pernos/tornillos decorativos ──
const posPernos = [
  [-0.35, 1.1, 0.43], [0.35, 1.1, 0.43],
  [-0.35, 1.1, -0.43], [0.35, 1.1, -0.43]
];
posPernos.forEach(([x, y, z]) => {
  const perno = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8),
    matPlata
  );
  perno.position.set(x, y, z);
  grupo.add(perno);
});

// Centrar el grupo verticalmente
grupo.position.set(-0.3, -1.2, 0);
scene.add(grupo);

// ── Animación ──
let time = 0;
function animar() {
  requestAnimationFrame(animar);
  time += 0.012;
  grupo.rotation.y = time;
  // Leve oscilación vertical
  grupo.position.y = -1.2 + Math.sin(time * 0.8) * 0.04;
  renderer.render(scene, camera);
}
animar();
