// init canvas
function initCanvas (canvas, max) {
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

  const size = { width, height }
  const fUnit = { fWunit, fHunit, ...max }

  const { units } = createGrid(ctx, size, fUnit)
  return { ctx, size, units }
}

// create grid of cartesian plane
function createGrid (ctx, size, fUnit) {
  let { fWunit, fHunit, maxX, maxY } = fUnit
  let { width, height } = size

  //prepare lines color and width
  ctx.strokeStyle = 'rgb(0,0,0,0.4)'
  ctx.lineWidth = 1

  let gcd = greatestCommonDivisor(maxX, maxY)

  //max value of X
  const wUnit = maxX / gcd
  //max value of Y
  const hUnit = maxY / gcd

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
    ctx.fillText(
      Math.abs((i / heightInterval) * gcd).toFixed(2),
      x,
      i + hLineMiddle,
      fWunit
    )
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
    ctx.fillText(
      Math.abs((i / widthInterval) * gcd).toFixed(),
      i - vLineMiddle,
      y,
      fWunit
    )
  }
  ctx.stroke()

  return {
    ctx,
    units: {
      widthInterval: widthInterval / gcd,
      heightInterval: heightInterval / gcd
    },
    size
  }
}
// graph a  restriction function
function graphFn ({ ctx = ctx, size, units, fn = {} }) {
  //destructuring information of units and functions
  const { widthInterval, heightInterval } = units
  const { x1, y1, x2, y2, d } = fn
  const { width, height } = size
  // plot function line

  ctx.strokeStyle = 'rgb(0,0,0,1)'
  ctx.beginPath()
  ctx.moveTo(x1 * widthInterval, -(y1 * heightInterval))
  ctx.lineTo(x2 * widthInterval, -(y2 * heightInterval))
  ctx.stroke()

  // plot accepted plane
  ctx.fillStyle = 'rgb(0,0,0,0.3)'
  ctx.beginPath()
  ctx.moveTo(x1 * widthInterval, -(y1 * heightInterval))
  ctx.lineTo(x2 * widthInterval, -(y2 * heightInterval))

  if (d == 2) {
    ctx.lineTo(0, 0)
  } else if (d == 1) {
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
function graphChart (ctx, units, vectors = []) {
  //Sort objects in array
  vectors.sort((a, b) => a.x - b.x + a.y + b.y)

  const { widthInterval, heightInterval } = units
  // add style things
  ctx.fillStyle = 'rgb(255,128,0,0.7)'
  ctx.beginPath()
  //initial dot on the coordinates.
  const { x, y } = vectors[0]
  ctx.moveTo(x * widthInterval, -(y * heightInterval))
  // iterate all coordinates and draw a line between they
  vectors.forEach(interval => {
    const { x, y } = interval
    ctx.lineTo(x * widthInterval, -(y * heightInterval))
  })
  // close and fill path
  ctx.closePath()
  ctx.fill()
  // graph point of intersections
  vectors.forEach(inter => {
    ctx.fillStyle = 'rgb(255,0,0,0.8)'
    ctx.strokeStyle = 'rgb(255,128,0,0.8)'
    ctx.beginPath()
    ctx.arc(
      inter.x * widthInterval,
      -(inter.y * heightInterval),
      4,
      0,
      2 * Math.PI,
      false
    )
    ctx.fill()
    ctx.stroke()
  })
}
//helper
function getFontSize () {
  return Number(
    window
      .getComputedStyle(document.body)
      .getPropertyValue('font-size')
      .match(/\d+/)[0]
  )
}
// get the  greatest common divisor
const greatestCommonDivisor = (a, b) => {
  // https://parzibyte.me/blog
  let temporal //Para no perder b
  while (b !== 0) {
    temporal = b
    b = a % b
    a = temporal
  }
  return a
}
// generar un color random
const getRandomRgbColor = () => {
  const r = Math.random() * 255
  const g = Math.random() * 255
  const b = Math.random() * 255
  return `rgb(${r}, ${g}, ${b})`
}
// return an array with the max of two attributes of an object[]
function maxMax (array, a, b) {
  let length = array.length
  let maxA = array[length - 1][a]
  let maxB = array[length - 1][b]
  while (length--) {
    if (array[length][a] > maxA) {
      maxA = array[length][a]
    }
    if (array[length][b] > maxB) {
      maxB = array[length][b]
    }
  }
  return [maxA, maxB]
}
// const canvas = document.querySelector('#graph')

// canvas.width =
//   canvas.parentElement.parentElement.previousElementSibling.firstElementChild.offsetWidth
// canvas.height =
//   canvas.parentElement.parentElement.previousElementSibling.firstElementChild.offsetHeight

// window.addEventListener('resize', () => {
//   canvas.width = canvas.parentElement.parentElement.previousElementSibling.firstElementChild.offsetWidth
//   canvas.height = canvas.parentElement.parentElement.previousElementSibling.firstElementChild.offsetHeight
//   let {
//     ctx,
//     size,
//     fUnit: { fWunit, fHunit }
//   } = initCanvas(canvas)
//   let [maxX, maxY] = maxMax(restricciones, 'x2', 'y1')

//   let { units } = createGrid(ctx, size, { fWunit, fHunit, maxX, maxY })
//   restricciones.forEach(re => {
//     graph(ctx, units, size, re)
//   })
//   graphChart(ctx, units, vertices)
// })

export {
  initCanvas,
  createGrid,
  graphFn,
  graphChart,
  greatestCommonDivisor,
  getRandomRgbColor,
  getFontSize,
  maxMax
}
