const canvas = document.getElementById('graph');

canvas.width = canvas.parentElement.clientWidth; // menos un pequeño margen a la derecha
canvas.height = canvas.parentElement.clientHeight; // menos un pequeño margen a la derecha
let hUnit = canvas.width / 45; // unidades horizontales (en lugar de 45 debería ser el valor de 'x' mas alto de los puntos de las restricciones + una holgura para dejar espacio en los bordes del gráfico)
let vUnit = canvas.height / 90; // unidades verticales, aplica lo mismo de la de arriba
let height = canvas.height - vUnit * 5; // - 5 unidades de holgura para tener espacio para las etiquetas y tal
let width = canvas.width;
// actualizar las variables y redibujar el canvas al redimensionar la ventana
window.addEventListener('resize', () => {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  hUnit = canvas.width / 45;
  vUnit = canvas.height / 90;
  height = canvas.height - vUnit * 5;
  width = canvas.width;
  draw();
});

// generar un color random
const getRandomRgbColor = () => {
  const r = Math.random() * 255;
  const g = Math.random() * 255;
  const b = Math.random() * 255;
  return `rgb(${r}, ${g}, ${b})`;
};

// dibujar la gráfica
function draw() {
  // restricciones de prueba
  const restrictions = [
    [
      { x: 0, y: 80 },
      { x: 20, y: 0 },
    ],
    [
      { x: 0, y: 70 },
      { x: 5, y: 0 },
    ],
    [
      { x: 0, y: 50 },
      { x: 40, y: 0 },
    ],
    [
      { x: 0, y: 30 },
      { x: 40, y: 0 },
    ],
  ];

  const ctx = canvas.getContext('2d');

  // mover el origen 3 unidades a la derecha para dejar un espacio para las etiquetas
  ctx.translate(hUnit * 3, 0);

  // dibujar ejes
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, height);
  ctx.lineTo(width, height);
  ctx.stroke();

  // ### dibujar cuadricula ###
  ctx.strokeStyle = 'rgb(0,0,0,0.1)';
  // lineas horizontales
  // j = #unidades - unidades de holgura
  for (let i = 0, j = 85; i < height; i += vUnit * 5, j -= 5) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();

    ctx.fillText(`${j}`, -(hUnit * 2), i);
  }

  // lineas verticales
  for (let i = 0, j = 0; i < width; i += hUnit * 5, j++) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();

    ctx.fillText(`${j * 5}`, i, height + vUnit * 3);
  }

  // ### dibujar restricciones ###
  for (let restriction of restrictions) {
    ctx.strokeStyle = getRandomRgbColor();
    ctx.beginPath();
    ctx.moveTo(restriction[0].x * hUnit, height - restriction[0].y * vUnit);
    ctx.lineTo(restriction[1].x * hUnit, height - restriction[1].y * vUnit);
    ctx.stroke();
  }
}

draw();
