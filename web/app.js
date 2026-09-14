import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";

const $ = (selector) => document.querySelector(selector);
const container = $("#model-viewer");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000);
camera.position.set(90, 55, 95);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
container.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
scene.add(new THREE.HemisphereLight(0xd8efff, 0x15283b, 2.4));
const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
keyLight.position.set(70, 90, 80);
scene.add(keyLight);
const fillLight = new THREE.DirectionalLight(0x35c2ff, 1.8);
fillLight.position.set(-70, 20, -50);
scene.add(fillLight);
const grid = new THREE.GridHelper(180, 18, 0x466781, 0x1a3348);
grid.position.y = -16;
scene.add(grid);
const modelGroup = new THREE.Group();
modelGroup.rotation.y = Math.PI / 2;
scene.add(modelGroup);
const machineGroup = new THREE.Group();
machineGroup.visible = false;
scene.add(machineGroup);
const spindleGroup = new THREE.Group();
machineGroup.add(spindleGroup);
const loader = new STLLoader();
let finishedMesh;
let stockMesh;
let toolTip;
let currentModel = "finished";
let spindleAngle = 0;
const state = { lines: [], blocks: [], index: 0, playing: false, timer: 0, x: 32, z: 2, spindle: 0, feed: 0, tool: "--" };

function material(color, opacity = 1) {
  return new THREE.MeshStandardMaterial({ color, metalness: 0.58, roughness: 0.3, transparent: opacity < 1, opacity });
}
function box(size, color, position, parent = machineGroup, opacity = 1) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, opacity));
  mesh.position.set(...position);
  parent.add(mesh);
  return mesh;
}
function cylinder(radius, length, color, position, rotation = [0, 0, 0], parent = spindleGroup) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 32), material(color));
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}
function loadSTL(path, meshMaterial) {
  return new Promise((resolve, reject) => loader.load(path, (geometry) => {
    geometry.computeVertexNormals();
    geometry.translate(0, 0, 32.5);
    resolve(new THREE.Mesh(geometry, meshMaterial));
  }, undefined, reject));
}
function buildMachine() {
  box([170, 5, 90], 0x263b48, [0, -18, 0]);
  box([170, 90, 4], 0x314958, [0, 28, -44], machineGroup, 0.42);
  box([4, 90, 88], 0x314958, [-84, 28, 0], machineGroup, 0.48);
  box([4, 90, 88], 0x314958, [84, 28, 0], machineGroup, 0.48);
  box([65, 32, 54], 0x45545b, [-44, 1, 0]);
  cylinder(24, 14, 0x8b9aa0, [-8, 1, 0], [0, 0, Math.PI / 2]);
  for (let jaw = 0; jaw < 3; jaw += 1) {
    const angle = jaw * Math.PI * 2 / 3;
    box([6, 18, 8], 0x17252d, [-8 + Math.cos(angle) * 14, 1 + Math.sin(angle) * 14, 0], spindleGroup);
  }
  cylinder(7, 58, 0xb77445, [22, 1, 0], [0, 0, Math.PI / 2]);
  box([14, 4, 42], 0xd8a64d, [22, -8, 0]);
  box([18, 5, 8], 0xd8a64d, [22, 0, 0]);
  box([22, 18, 22], 0x51636b, [61, 0, 0]);
  toolTip = box([8, 5, 5], 0x55d98d, [28, 7, 0]);
  cylinder(12, 12, 0x8b9aa0, [55, 1, 0], [0, 0, Math.PI / 2]);
  const light = new THREE.PointLight(0xffe7ad, 2, 130);
  light.position.set(0, 35, 0);
  machineGroup.add(light);
  box([12, 12, 5], 0xc7d3d7, [-68, 67, 32]);
  const origin = new THREE.AxesHelper(16);
  origin.position.set(0, 1, 0);
  machineGroup.add(origin);
}
function updateView(name) {
  currentModel = name;
  finishedMesh.visible = name === "finished" || name === "compare";
  stockMesh.visible = name === "stock" || name === "compare";
  machineGroup.visible = name === "machine";
  document.querySelectorAll(".model-button").forEach((button) => {
    const selected = button.dataset.model === name;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
}
function resize() {
  const width = container.clientWidth;
  const height = Math.max(container.clientHeight, 420);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}
function parseBlock(text, index) {
  const get = (letter) => {
    const match = text.match(new RegExp(`${letter}(-?\\d+(?:\\.\\d+)?)`, "i"));
    return match ? Number(match[1]) : null;
  };
  return { index, x: get("X"), z: get("Z"), feed: get("F"), speed: get("S"), rapid: /G00/i.test(text), feedMove: /G0?1/i.test(text), tool: text.match(/T\d{4}/i)?.[0] || null, cycle: text.match(/G(70|71|76)/i)?.[0] || null };
}
function syntax(line) {
  return line.replace(/\(.*?\)/g, '<span class="comment">$&</span>').replace(/\b([GMT]\d+(?:\.\d+)?)\b/gi, '<span class="code">$&</span>').replace(/\b([XYZFS]-?\d+(?:\.\d+)?)\b/gi, '<span class="coordinate">$&</span>');
}
function renderProgram() {
  $("#gcode-display").innerHTML = state.lines.map((line, index) => `<div class="gcode-line${index === state.index ? " current" : ""}"><span>${String(index + 1).padStart(3, "0")}</span><code>${syntax(line || " ")}</code></div>`).join("");
  const current = state.blocks[state.index];
  if (!current) return;
  if (current.x !== null) state.x = current.x;
  if (current.z !== null) state.z = current.z;
  if (current.feed !== null) state.feed = current.feed;
  if (current.speed !== null) state.spindle = current.speed;
  if (current.tool) state.tool = current.tool;
  $("#position-x").textContent = `${state.x.toFixed(2)} mm`;
  $("#position-z").textContent = `${state.z.toFixed(2)} mm`;
  $("#spindle-speed").textContent = `${state.spindle || 0} rpm`;
  $("#feed-rate").textContent = `${state.feed || 0} mm/rev`;
  $("#active-tool").textContent = state.tool;
  $("#cycle-state").textContent = current.cycle ? `${current.cycle} detected` : "none detected";
  if (toolTip) {
    toolTip.position.set((state.z || 0) + 20, (state.x || 0) / 2, 0);
    toolTip.material.color.set(current.feedMove ? 0xffa62b : 0x55d98d);
  }
  const currentLine = $("#gcode-display .current");
  if (currentLine) currentLine.scrollIntoView({ block: "nearest" });
}
async function loadProgram(path) {
  state.playing = false;
  $("#program-status").textContent = "Loading NC program...";
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error("Program request failed");
    state.lines = (await response.text()).split(/\r?\n/);
    state.blocks = state.lines.map(parseBlock);
    state.index = 0;
    $("#program-status").textContent = `${state.lines.length} fetched blocks | visual approximation`;
    renderProgram();
  } catch (error) {
    $("#program-status").textContent = "Program unavailable. Start the site through a local HTTP server.";
  }
}
function step(direction) {
  state.index = Math.max(0, Math.min(state.lines.length - 1, state.index + direction));
  renderProgram();
}
document.querySelectorAll(".model-button").forEach((button) => button.addEventListener("click", () => updateView(button.dataset.model)));
$("#reset-view").addEventListener("click", () => { camera.position.set(90, 55, 95); controls.target.set(0, 0, 0); controls.update(); });
$("#program-select").addEventListener("change", (event) => loadProgram(event.target.value));
$("#play-program").addEventListener("click", () => { state.playing = true; });
$("#pause-program").addEventListener("click", () => { state.playing = false; });
$("#previous-block").addEventListener("click", () => { state.playing = false; step(-1); });
$("#next-block").addEventListener("click", () => { state.playing = false; step(1); });
$("#reset-program").addEventListener("click", () => { state.playing = false; state.index = 0; renderProgram(); });
$("#tool-select").addEventListener("change", (event) => {
  const details = {
    T0101: ["Facing and OD turning", "CNMG / DNMG carbide", "0.15 mm/rev", "140 m/min"],
    T0202: ["Relief groove", "MGMN carbide", "0.08 mm/rev", "100 m/min"],
    T0303: ["M12 x 1 external thread", "60-degree carbide", "1.00 mm/rev", "50-80 m/min"],
    T0404: ["Parting", "Parting insert", "0.06 mm/rev", "80-100 m/min"]
  }[event.target.value];
  $("#tool-operation").textContent = details[0];
  $("#tool-insert").textContent = details[1];
  $("#tool-feed").textContent = details[2];
  $("#tool-speed").textContent = details[3];
});
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
new ResizeObserver(resize).observe(container);
buildMachine();
Promise.all([loadSTL("cad/exports/drawing-02-cnc-component.stl", material(0x35c2ff)), loadSTL("cad/exports/drawing-02-raw-stock.stl", material(0xaeb8c2, 0.62))]).then(([finished, stock]) => { finishedMesh = finished; stockMesh = stock; modelGroup.add(finishedMesh, stockMesh); updateView("finished"); $("#viewer-status").hidden = true; resize(); }).catch(() => { $("#viewer-status").textContent = "The 3D models could not be loaded. Run this page through a local web server."; resize(); });
loadProgram($("#program-select").value);
let lastTime = performance.now();
function animate(time) {
  requestAnimationFrame(animate);
  const elapsed = time - lastTime;
  lastTime = time;
  if (state.playing && !reducedMotion) {
    state.timer += elapsed;
    if (state.timer > Number($("#simulation-speed").value)) {
      state.timer = 0;
      step(1);
      if (state.index >= state.lines.length - 1) state.playing = false;
    }
  }
  if (state.spindle && currentModel === "machine") { spindleAngle += elapsed * 0.004; spindleGroup.rotation.x = spindleAngle; }
  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);
