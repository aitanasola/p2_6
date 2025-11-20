// --------------------------------------------
// CONFIGURACIÓN
// --------------------------------------------
let paletaBase = ['#F3B23E','#4FAD32','#EB46AB','#54A1D1','#4F0B9E'];
let paleta = [];

const baseW = 700;
const baseH = 1000;

let piezas = [];
let estado = "montada";

// Marco
let marco = {
  x: 0,
  y: 0,
  w: 0,
  h: 0
};

let handleSize = 25;
let activeHandle = null;
let draggingMarco = false;
let offsetDragX = 0;
let offsetDragY = 0;

// Escala
let scaleGlobal = 1;


// --------------------------------------------
// SETUP
// --------------------------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);

  paleta = paletaBase.slice();

  inicializarPiezas();
  ajustarMarcoResponsive();
  actualizarEscala();
}


// -------------------------------------------------------------
// RESPONSIVE → Fija marco para que encaje en pantalla siempre
// -------------------------------------------------------------
function ajustarMarcoResponsive() {
  let margen = 60;

  let sw = width - margen * 2;
  let sh = height - margen * 2;

  let escW = sw / baseW;
  let escH = sh / baseH;

  scaleGlobal = min(escW, escH);

  marco.w = baseW * scaleGlobal;
  marco.h = baseH * scaleGlobal;

  marco.x = (width - marco.w) / 2;
  marco.y = (height - marco.h) / 2;
}

function actualizarEscala() {
  scaleGlobal = marco.w / baseW;
}


// --------------------------------------------
// DRAW
// --------------------------------------------
function draw() {
  background(0);
  actualizarEscala();

  push();
  translate(marco.x, marco.y);
  scale(scaleGlobal);

  // Marco visual interno
  noFill();
  stroke(255);
  strokeWeight(4);
  rect(0, 0, baseW, baseH);

  actualizarPiezas();
  dibujarPiezas();
  dibujarHandles();

  pop();
}


// -------------------------------------------------------------
// HANDLES DEL MARCO
// -------------------------------------------------------------
function dibujarHandles() {
  let hs = handleSize / scaleGlobal;

  let corners = [
    { name: "tl", x: 0, y: 0 },
    { name: "tr", x: baseW, y: 0 },
    { name: "bl", x: 0, y: baseH },
    { name: "br", x: baseW, y: baseH }
  ];

  noStroke();
  fill(255);

  for (let c of corners) {
    push();
    rectMode(CENTER);
    rect(c.x, c.y, hs, hs, 4);
    pop();
  }
}


// -------------------------------------------------------------
// MOUSE EVENTS
// -------------------------------------------------------------
function mousePressed() {
  let mx = (mouseX - marco.x) / scaleGlobal;
  let my = (mouseY - marco.y) / scaleGlobal;

  let hs = handleSize / scaleGlobal;

  // Detectar handle activo
  let corners = [
    { name: "tl", x: 0, y: 0 },
    { name: "tr", x: baseW, y: 0 },
    { name: "bl", x: 0, y: baseH },
    { name: "br", x: baseW, y: baseH }
  ];

  for (let c of corners) {
    if (abs(mx - c.x) < hs && abs(my - c.y) < hs) {
      activeHandle = c.name;
      return;
    }
  }

  // Clic en pieza
  let idx = detectarClicEnPieza(mx, my);
  if (idx !== -1) {
    paleta[idx] = random(paletaBase);
    return;
  }

  // Clic dentro del marco → arrastre del marco
  if (
    mouseX > marco.x &&
    mouseX < marco.x + marco.w &&
    mouseY > marco.y &&
    mouseY < marco.y + marco.h
  ) {
    draggingMarco = true;
    offsetDragX = mouseX - marco.x;
    offsetDragY = mouseY - marco.y;
    return;
  }

  // Si clic fuera → desmontar/montar
  toggleSilla();
}

function mouseDragged() {
  // Redimensionar
  if (activeHandle) {
    redimensionarMarco();
    return;
  }

  // Arrastrar marco
  if (draggingMarco) {
    marco.x = mouseX - offsetDragX;
    marco.y = mouseY - offsetDragY;
    return;
  }
}

function mouseReleased() {
  activeHandle = null;
  draggingMarco = false;
}


// -------------------------------------------------------------
// REDIMENSIONADO DEL MARCO
// -------------------------------------------------------------
function redimensionarMarco() {
  let minW = 150;
  let minH = 150;

  if (activeHandle === "tl") {
    let newW = (marco.x + marco.w) - mouseX;
    let newH = (marco.y + marco.h) - mouseY;

    if (newW > minW) {
      marco.x = mouseX;
      marco.w = newW;
    }
    if (newH > minH) {
      marco.y = mouseY;
      marco.h = newH;
    }
  }

  if (activeHandle === "tr") {
    let newW = mouseX - marco.x;
    let newH = (marco.y + marco.h) - mouseY;

    if (newW > minW) marco.w = newW;
    if (newH > minH) {
      marco.y = mouseY;
      marco.h = newH;
    }
  }

  if (activeHandle === "bl") {
    let newW = (marco.x + marco.w) - mouseX;
    let newH = mouseY - marco.y;

    if (newW > minW) {
      marco.x = mouseX;
      marco.w = newW;
    }
    if (newH > minH) marco.h = newH;
  }

  if (activeHandle === "br") {
    let newW = mouseX - marco.x;
    let newH = mouseY - marco.y;

    if (newW > minW) marco.w = newW;
    if (newH > minH) marco.h = newH;
  }
}


// -------------------------------------------------------------
// TOGGLE Silla
// -------------------------------------------------------------
function toggleSilla() {
  if (estado === "montada") {
    estado = "desmontada";
    for (let p of piezas) {
      p.velY = random(5, 12);
      p.velAng = random(-0.05, 0.05);
      p.dx = 0;
      p.dy = 0;
      p.estado = "cayendo";
    }
  } else {
    for (let p of piezas) p.estado = "montando";
    estado = "montada";
  }
}


// -------------------------------------------------------------
// SILLA
// -------------------------------------------------------------
function inicializarPiezas() {
  piezas = [
    { tipo:"linea", x1:200,y1:15,  x2:0,y2:400,   ang:0,dx:0,dy:0, velY:0,velAng:0, estado:"montada" },
    { tipo:"bezier", x1:0,y1:400, cx1:200,cy1:600, cx2:500,cy2:600, x2:700,y2:400, ang:0,dx:0,dy:0, velY:0,velAng:0, estado:"montada" },
    { tipo:"linea", x1:500,y1:15, x2:700,y2:400,   ang:0,dx:0,dy:0, velY:0,velAng:0, estado:"montada" },
    { tipo:"linea", x1:200,y1:15, x2:500,y2:15,    ang:0,dx:0,dy:0, velY:0,velAng:0, estado:"montada" },
    { tipo:"linea", x1:200,y1:500, x2:200,y2:900,  ang:0,dx:0,dy:0, velY:0,velAng:0, estado:"montada" },
    { tipo:"linea", x1:500,y1:500, x2:500,y2:900,  ang:0,dx:0,dy:0, velY:0,velAng:0, estado:"montada" }
  ];
}

function actualizarPiezas() {
  let suelo = 1000;

  for (let p of piezas) {
    if (p.estado === "cayendo") {
      p.dy += p.velY;
      p.velY += 0.6;
      p.ang += p.velAng;
      if (p.y2 + p.dy >= suelo) p.estado = "suelo";
    }

    if (p.estado === "montando") {
      p.dx = lerp(p.dx, 0, 0.12);
      p.dy = lerp(p.dy, 0, 0.12);
      p.ang = lerp(p.ang, 0, 0.12);
      if (
        abs(p.dx) < 0.1 &&
        abs(p.dy) < 0.1 &&
        abs(p.ang) < 0.01
      ) {
        p.dx = 0;
        p.dy = 0;
        p.ang = 0;
        p.estado = "montada";
      }
    }
  }
}

function dibujarPiezas() {
  strokeWeight(80);

  for (let i = 0; i < piezas.length; i++) {
    let p = piezas[i];
    stroke(paleta[i] + "80");

    push();
    translate(p.dx, p.dy);
    translate(p.x1, p.y1);
    rotate(p.ang);
    translate(-p.x1, -p.y1);

    if (p.tipo === "linea") {
      line(p.x1, p.y1, p.x2, p.y2);
    } else {
      bezier(p.x1, p.y1, p.cx1, p.cy1, p.cx2, p.cy2, p.x2, p.y2);
    }
    pop();
  }
}


// -------------------------------------------------------------
// DETECTAR CLIC EN PIEZA
// -------------------------------------------------------------
function detectarClicEnPieza(mx, my) {
  for (let i = 0; i < piezas.length; i++) {
    let p = piezas[i];
    if (p.tipo === "linea") {
      if (pointOnLine(mx, my, p.x1 + p.dx, p.y1 + p.dy, p.x2 + p.dx, p.y2 + p.dy))
        return i;
    }
    if (p.tipo === "bezier") {
      if (abs(my - 500) < 120) return 1;
    }
  }
  return -1;
}

function pointOnLine(px, py, x1, y1, x2, y2) {
  const d1 = dist(px, py, x1, y1);
  const d2 = dist(px, py, x2, y2);
  const L = dist(x1, y1, x2, y2);
  return abs(d1 + d2 - L) < 25;
}


// -------------------------------------------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  ajustarMarcoResponsive();
}
