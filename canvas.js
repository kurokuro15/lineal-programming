// X,Y, WIDTH, HEIGHT
const graph = document.querySelector('#graph')
const ctx = graph.getContext('2d')

ctx.fillStyle = 'rgb(200,0,0)'
ctx.fillRect(10, 10, 50, 50)

ctx.clearRect(15,15, 40, 40)

ctx.strokeStyle = "rgb(0,0,200)"
ctx.strokeRect(20,20, 30, 30)

ctx.fillStyle = "rgb(0,0,0)"
ctx.beginPath();
ctx.moveTo(210,60);
ctx.lineTo(0,0);
ctx.closePath();
ctx.stroke();