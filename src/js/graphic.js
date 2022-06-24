/**
 * @typedef {import('./logic.js').ResultVertex} ResultVertex
 * @typedef {import('./logic.js').RestrictionLine} RestrictionLine
 */

/* ###################################################################################### */
/* ######### Declaración de constante para la creación de gráficos en el canvas ######### */
/* ###################################################################################### */

/**
 * @type {string[]} Array de colores para la graficación de las restricciones
 */
const colors = [
  ['rgb(2, 48, 71)', 'rgb(2, 48, 71, 0.2)'],
  ['rgb(214, 40, 40)', 'rgb(247, 127, 0, 0.2)'],
  ['rgb(0, 109, 119)', 'rgb(0, 109, 119, 0.2)'],
  ['rgb(97, 19, 205)', 'rgb(127, 50, 236, 0.2)']
]

/* ###################################################################################### */
/* ######### Declaración de funciones para la creación de gráficos en el canvas ######### */
/* ###################################################################################### */

/**
 * Función para obtener el 'font-size' en píxeles del css global
 * @returns Font size
 */
function getFontSize() {
  return Number(
    window.getComputedStyle(document.body).getPropertyValue('font-size').match(/\d+/)[0]
  )
}

/**
 * Función para obtener el valor máximo de dos propiedades de un array de objetos
 * @param {Array<object>} array
 * @param {string} a
 * @param {string} b
 * @returns An array with the max of two properties of an object array
 */
function maxMax(array, a, b) {
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

/**
 * Función para calcular el medio entre dos coordenadas
 * @param {number} x1
 * @param {number} x2
 * @param {number} y1
 * @param {number} y2
 * @returns Mid point between the points
 */
function calcMidPoint(x1, x2, y1, y2) {
  return [(x1 + x2) / 2, (y1 + y2) / 2]
}

/**
 * Función para calcular el intervalo a utilizar en el plano carteciano
 * @param {number} steps Desired steps
 * @param {number} min Minimum value of the range
 * @param {number} max Maximum value of the range
 * @returns The optimal step size
 */
function getStepSize(steps, min, max) {
  const oMin = min
  const oMax = max
  const desiredSteps = steps
  const range = max - min

  // find magnitude and steps in powers of 10
  const step = range / steps
  const mag10 = Math.ceil(Math.log(step) / Math.log(10))
  const baseStepSize = Math.pow(10, mag10)

  const trySteps = [5, 4, 2, 1]
  let stepSize

  for (let i = 0; i < trySteps.length; i++) {
    stepSize = baseStepSize / trySteps[i]
    const ns = Math.round(range / stepSize)
    // bail if anything didn't work, We can't check float.ZeroTolernace anywhere since we should
    // work on arbitrary range values
    if (isNaN(baseStepSize) || isNaN(ns) || ns < 1) return

    min = Math.floor(oMin / stepSize) * stepSize
    max = Math.ceil(oMax / stepSize) * stepSize
    steps = parseInt(Math.round((max - min) / stepSize))

    if (steps <= desiredSteps) break
  }
  return stepSize
}

/* ###################################################################################### */
/* ######## Declaración de la clase principal controladora del canvas y graficos ######## */
/* ###################################################################################### */
export default class Graph {
  /**
   * Clase para crear el gráfico y manejar el canvas
   * @param {HTMLCanvasElement} canvas
   * @param {object} data The data to be plotted
   * @param {Array<RestrictionLine>} data.lines
   * @param {Array<ResultVertex>} data.vertices
   */
  constructor(canvas, data) {
    this.ctx = canvas.getContext('2d')
    this.width = canvas.width
    this.height = canvas.height
    this.data = data

    // 1 em === fontSize === 16px by default
    const fontSize = getFontSize()
    const fontWidth = getFontSize() / 2

    // fWunit === "0000" and fHunit === 1em + 4 px
    this.fWunit = fontWidth * 4
    this.fHunit = fontSize + 4

    // Calc width and height units
    ;[this.maxX, this.maxY] = maxMax(data.lines, 'x2', 'y1')
    const marginUnits = 25
    this.xStepSize = getStepSize(8, 0, this.maxX + marginUnits)
    this.yStepSize = getStepSize(8, 0, this.maxY + marginUnits)

    this.wUnit = (this.width - this.fWunit) / (this.maxX + marginUnits)
    this.hUnit = (this.height - this.fHunit) / (this.maxY + marginUnits)

    // Redraw graph on window resize
    window.addEventListener('resize', () => {
      this.draw()
    })

    this.draw()
  }

  /**
   * Dibuja el plano cartesiano
   */
  draw() {
    const { ctx, fWunit, width, height, fHunit } = this
    // Restore origin so I can clear the canvas like a human being
    ctx.restore()
    ctx.clearRect(0, 0, width, height)

    // Save state before translating origin
    ctx.save()

    // Traslate origin coordinate to right-bottom side
    // with an space for tags of 1em
    ctx.translate(fWunit, height - fHunit)

    this.initPlot()
    this.drawGrid()
    this.data.lines.forEach((line, i) => this.drawRestriction(line, i))
    this.data.lines.forEach((line, i) => this.drawRestrictionTag(line, i))
    this.drawVertices(this.data.vertices)
  }

  /**
   * Inicia el trazado de los ejes XY
   */
  initPlot() {
    const { ctx, width, height } = this

    // Prepare lines color and width
    ctx.strokeStyle = 'rgb(0,0,0)'
    ctx.lineWidth = 2

    // Draw X/Y axes
    ctx.beginPath()
    ctx.moveTo(0, -height)
    ctx.lineTo(0, 0)
    ctx.lineTo(width, 0)
    ctx.stroke()
  }

  /**
   * Dibuja la cuadrícula de fondo basada en
   * las unidades calculadas
   */
  drawGrid() {
    const { ctx, width, height, fWunit, fHunit, wUnit, hUnit, yStepSize, xStepSize } =
      this

    // prepare lines color and width
    ctx.strokeStyle = 'rgb(0,0,0,0.4)'
    ctx.lineWidth = 1

    // Middle of horizontal lines
    const hLineMiddle = (fHunit * 0.25) / 2

    // X axis for tags
    const x = -fWunit

    // Horizontal lines for Y axis
    ctx.beginPath()
    for (let i = 0, j = 0; i > -height; i -= hUnit * yStepSize, j += yStepSize) {
      ctx.moveTo(0, i)
      ctx.lineTo(width, i)
      ctx.fillText(Math.abs(j), x, i + hLineMiddle, fWunit)
    }
    ctx.stroke()

    // Middle of vertical lines
    const vLineMiddle = (fWunit * 0.25) / 2.5
    // Width interval calculate by units
    // Y axis for tags
    const y = fHunit / 2
    // Vertical lines for x axis
    ctx.beginPath()
    for (let i = 0, j = 0; i < width; i += wUnit * xStepSize, j += xStepSize) {
      ctx.moveTo(i, 0)
      ctx.lineTo(i, -height)
      ctx.fillText(Math.abs(j), i - vLineMiddle, y + fHunit / 2, fWunit)
    }
    ctx.stroke()
  }

  /**
   * Traza una restricción pasada por parámetros en el plano cartesiano
   * @param {RestrictionLine} restriction
   * @param {number} i Restriction index
   */
  drawRestriction(restriction, i) {
    const { ctx, width, height, wUnit, hUnit } = this
    const { x1, y1, x2, y2, d } = restriction

    const [color, transparentColor] = colors[i]

    // Draw function line
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(x1 * wUnit, -(y1 * hUnit))
    ctx.lineTo(x2 * wUnit, -(y2 * hUnit))
    ctx.stroke()

    // Draw accepted plane
    ctx.fillStyle = transparentColor
    ctx.beginPath()
    ctx.moveTo(x1 * wUnit, -(y1 * hUnit))
    ctx.lineTo(x2 * wUnit, -(y2 * hUnit))

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

  /**
   * Traza la etiqueta de una restricción
   * pasada por parámetro
   * @param {RestrictionLine} restriction
   * @param {number} i Restriction index
   */
  drawRestrictionTag(restriction, i) {
    const { ctx, wUnit, hUnit } = this
    const { x1, y1, x2, y2 } = restriction

    const midPoint = calcMidPoint(x1 * wUnit, -(y1 * hUnit), x2 * wUnit, -(y2 * hUnit))

    const [color] = colors[i]

    // Write restriction tag
    ctx.fillStyle = color
    ctx.fillText(`Restricción ${i + 1}`, midPoint[1] + 4, midPoint[0] - 4)
  }

  /**
   * Dibuja los vértices del sub-plano solución y sus etiquetas
   * @param {Array<ResultVertex>} vertices
   */
  drawVertices(vertices = []) {
    const { ctx, wUnit, hUnit } = this

    // Graph point of intersections
    vertices.forEach(inter => {
      ctx.fillStyle = 'rgb(255,0,0)'
      ctx.strokeStyle = 'rgb(255,128,0)'
      ctx.beginPath()
      ctx.arc(inter.x * wUnit, -(inter.y * hUnit), 4, 0, 2 * Math.PI, false)
      ctx.fill()
      ctx.stroke()

      // Graph intersections label
      ctx.fillStyle = 'rgb(0,0,0)'
      ctx.fillText(
        `(${inter.x}, ${inter.y})`,
        inter.x * wUnit + 4,
        -(inter.y * hUnit + 4)
      )
    })
  }
}
