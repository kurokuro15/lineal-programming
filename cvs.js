// init canvas
function initCanvas(canvas) {
  // create context
  const ctx = canvas.getContext('2d')

  // traslate origin coordinate to right-botton side
  // with an space for tags of 1em
  const { width, height } = canvas

  // 1 em === fontSize === 16px by default
  const fontSize = getFontSize()
  const fontWidth = getFontSize() / 2
  // fWunit === "0000" and fHunit === 1em + 4 px
  const fWunit = fontWidth * 4
  const fHunit = fontSize + 4
  ctx.translate(fWunit, height - fHunit)

  //prepare lines color and width
  ctx.strokeStyle = 'rgb(0,0,0)'
  ctx.lineWidth = 2
  // plot axies X/Y
  //plot X
  ctx.beginPath()
  ctx.moveTo(0, -height + fHunit)
  ctx.lineTo(0, 0)
  ctx.lineTo(width, 0)
  ctx.stroke()
  return { ctx, size: { width, height }, fUnit: { fWunit, fHunit } }
}
// create grid of cartesian plane
function createGrid(ctx, size, fUnit) {
  let { fWunit, fHunit, maxX, maxY } = fUnit
  let { width, height } = size

  //prepare lines color and width
  ctx.strokeStyle = 'rgb(0,0,0,0.4)'
  ctx.lineWidth = 1

  //max value of X
  wUnit = maxX || 20
  //max value of Y
  hUnit = maxY || 20

  // Middle of horizontal lines
  const hLineMiddle = (fHunit * 0.25) / 2
  // Height interval calculate by units
  const heightInterval = (height - fHunit) / (hUnit + 1)
  // x axie for tags
  const x = -fWunit
  // Horizontal Lines Y AXIE
  ctx.beginPath()
  for (let i = 0; i > -height; i -= heightInterval) {
    ctx.moveTo(0, i)
    ctx.lineTo(width, i)
    ctx.fillText(Math.abs(i / heightInterval).toFixed(2), x, i + hLineMiddle, fWunit)
  }
  ctx.stroke()

  // Middle of vertical lines
  const vLineMiddle = (fWunit * 0.25) / 2.5
  // Width interval calculate by units
  const widthInterval = (width - fWunit) / (wUnit + 1)
  // y axie for tags
  const y = fHunit / 2
  // Vertical Lines X AXIE
  ctx.beginPath()
  for (let i = 0; i < width; i += widthInterval) {
    ctx.moveTo(i, 0)
    ctx.lineTo(i, -height)
    ctx.fillText(Math.abs(i / widthInterval).toFixed(), i - vLineMiddle, y, fWunit)
  }
  ctx.stroke()

  return { ctx, units: { widthInterval, heightInterval }, size }
}
// graph a  restriction function
function graph(ctx, units, size, fn = {}) {
  //destructuring information of units and functions
  const { widthInterval, heightInterval } = units
  const { x1, y1, x2, y2, d } = fn
  const { width, height } = size
  // plot function line
  ctx.beginPath()
  ctx.moveTo(x1 * widthInterval, -(y1 * heightInterval))
  ctx.lineTo(x2 * widthInterval, -(y2 * heightInterval))
  ctx.stroke()

  // plot accepted plane
  ctx.fillStyle = 'rgb(0,0,0,0.3)'
  ctx.beginPath()
  ctx.moveTo(x1 * widthInterval, -(y1 * heightInterval))
  ctx.lineTo(x2 * widthInterval, -(y2 * heightInterval))

  if (d === 2) {
    ctx.lineTo(0, 0)
  } else if (d === 1) {
    ctx.lineTo(width, 0)
    ctx.lineTo(width, -height)
    ctx.lineTo(0, -height)
  } else {
    return ctx.stroke()
  }
  ctx.closePath()
  ctx.fill()
}
// Graph solution sub-plane
function graphChart(ctx, units, intervals = []) {
  //Sort objects in array
  intervals.sort((a, b) => a.x - b.x)
  const { widthInterval, heightInterval } = units
  // add style things
  ctx.fillStyle = 'rgb(255,128,0,0.7)'
  ctx.beginPath()
  //initial dot on the coordinates.
  const { x, y } = intervals[0]
  ctx.moveTo(x * widthInterval, -(y * heightInterval))
  // iterate all coordinates and draw a line between they
  intervals.forEach(interval => {
    const { x, y } = interval
    console.log(x, y)
    ctx.lineTo(x * widthInterval, -(y * heightInterval))
  })
  // close and fill path
  ctx.closePath()
  ctx.fill()
}
//helper
function getFontSize() {
  return Number(
    window.getComputedStyle(document.body).getPropertyValue('font-size').match(/\d+/)[0]
  )
}

const canvas = document.querySelector('canvas')

let {
  ctx,
  size,
  fUnit: { fWunit, fHunit }
} = initCanvas(canvas)

let maxX = 300
let maxY = 480
let { units } = createGrid(ctx, size, { fWunit, fHunit, maxX, maxY })

const restricciones = [
  { x1: 0, y1: 200, i: 0, x2: 300, y2: 0, d: 2 },
  { x1: 0, y1: 480, i: 0, x2: 240, y2: 0, d: 2 }
]

restricciones.forEach(re => {
  graph(ctx, units, size, re)
})

const vertices = [
	{ x: 0, y: 0 },
	{ x: 0, y: 200 },
	{ x: 240, y: 0 },
	{ x: 210, y: 60 }
]
graphChart(ctx, units, vertices)
