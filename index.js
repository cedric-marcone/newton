const G = 39.5;
const timeStep = 2 / 365.2;

const scale = 200;
const radius = 4;
const trail = Math.round(365.2 / (365.2 * timeStep));

// -------------------------------------------------------------

const masses = [
  {
    name: "Soleil",
    m: 1,
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    positions: [],
  },
  {
    name: "Mercure",
    m: 1.65956463e-7,
    x: -0.346390408691506,
    y: -0.272465544507684,
    z: 0.00951633403684172,
    vx: 4.25144321778261,
    vy: -7.61778341043381,
    vz: -1.01249478093275,
    positions: [],
  },
  {
    name: "Vénus",
    m: 2.44699613e-6,
    x: -0.168003526072526,
    y: 0.698844725464528,
    z: 0.0192761582256879,
    vx: -7.2077847105093,
    vy: -1.76778886124455,
    vz: 0.391700036358566,
    positions: [],
  },
  {
    name: "Terre",
    m: 3.0024584e-6,
    x: 0.648778995445634,
    y: 0.747796691108466,
    z: -3.22953591923124e-5,
    vx: -4.85085525059392,
    vy: 4.09601538682312,
    vz: -0.000258553333317722,
    positions: [],
  },
  {
    name: "Mars",
    m: 3.213e-7,
    x: -0.574871406752105,
    y: -1.395455041953879,
    z: -0.01515164037265145,
    vx: 4.9225288800471425,
    vy: -1.5065904473191791,
    vz: -0.1524041758922603,
    positions: [],
  },
];

// -------------------------------------------------------------

function updatePositionVectors() {
  for (let i = 0; i < masses.length; i++) {
    const mass = masses[i];
    mass.x += mass.vx * timeStep;
    mass.y += mass.vy * timeStep;
    mass.z += mass.vz * timeStep;
  }
}

function updateAccelerationVectors() {
  for (let i = 0; i < masses.length; i++) {
    const massI = masses[i];
    let ax = 0;
    let ay = 0;
    let az = 0;
    for (let j = 0; j < masses.length; j++) {
      if (i !== j) {
        const massJ = masses[j];
        const dx = massJ.x - massI.x;
        const dy = massJ.y - massI.y;
        const dz = massJ.z - massI.z;
        const distSq = dx * dx + dy * dy + dz * dz;
        const f = (G * massJ.m) / (distSq * Math.sqrt(distSq));
        // const f = G * (massJ.m / distSq);
        ax += dx * f;
        ay += dy * f;
        az += dz * f;
      }
    }
    massI.ax = ax;
    massI.ay = ay;
    massI.az = az;
  }
}

function updateVelocityVectors() {
  for (let i = 0; i < masses.length; i++) {
    const mass = masses[i];
    mass.vx += mass.ax * timeStep;
    mass.vy += mass.ay * timeStep;
    mass.vz += mass.az * timeStep;
  }
}

// -------------------------------------------------------------

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const width = (canvas.width = window.innerWidth);
const height = (canvas.height = window.innerHeight);

function storePosition(mass, x, y) {
  mass.positions.push({ x, y });
  if (mass.positions.length > trail) {
    mass.positions.shift();
  }
}

function draw(mass) {
  const positionsLen = mass.positions.length;

  for (let i = 0; i < positionsLen; i++) {
    let transparency;
    let circleScaleFactor;

    const scaleFactor = i / positionsLen;

    if (i === positionsLen - 1) {
      transparency = 1;
      circleScaleFactor = 1;
    } else {
      transparency = scaleFactor / 2;
      circleScaleFactor = scaleFactor;
    }

    ctx.beginPath();
    ctx.arc(
      mass.positions[i].x,
      mass.positions[i].y,
      circleScaleFactor * radius,
      // circleScaleFactor * (1 / mass.m),
      0,
      2 * Math.PI
    );

    ctx.fillStyle = `rgb(255, 255, 255, ${transparency})`;
    ctx.fill();
  }
}

for (const mass of masses) {
  console.log(mass.name, 1 / mass.m / 10000);
}

// -------------------------------------------------------------

let dragStart = { x: 0, y: 0 };
let dragPosition = { x: 0, y: 0 };
let dragging = false;

function dragStarted(e) {
  dragging = true;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
}
function drag(e) {
  dragPosition.x = e.clientX;
  dragPosition.y = e.clientY;
}
function dragEnded(e) {
  dragging = false;
  const x = (dragStart.x - width / 2) / scale;
  const y = (dragStart.y - height / 2) / scale;
  const vx = (e.clientX - dragStart.x) / 35;
  const vy = (e.clientY - dragStart.y) / 35;
  const z = 0;
  const vz = 0;
  const m = 1.0055304e-25; // 200000/(1,989 × 10^30)
  masses.push({ m, x, y, z, vx, vy, vz, positions: [] });
}

canvas.addEventListener("mousedown", dragStarted);
canvas.addEventListener("mousemove", drag);
canvas.addEventListener("mouseup", dragEnded);

canvas.addEventListener("touchstart", dragStarted);
canvas.addEventListener("touchmove", drag);
canvas.addEventListener("touchend", dragEnded);

// -------------------------------------------------------------

function animate() {
  updatePositionVectors();
  updateAccelerationVectors();
  updateVelocityVectors();

  ctx.clearRect(0, 0, width, height);

  for (let i = 0; i < masses.length; i++) {
    const mass = masses[i];
    const x = width / 2 + mass.x * scale;
    const y = height / 2 + mass.y * scale;

    storePosition(mass, x, y);
    draw(mass);

    if (mass.name) {
      ctx.font = "10px Arial";
      ctx.fillText(mass.name, x + 12, y + 4);
      ctx.fill();
    }
  }

  if (dragging) {
    ctx.beginPath();
    ctx.moveTo(dragStart.x, dragStart.y);
    ctx.lineTo(dragPosition.x, dragPosition.y);
    ctx.strokeStyle = "#f00";
    ctx.stroke();
  }

  requestAnimationFrame(animate);
}

animate();
