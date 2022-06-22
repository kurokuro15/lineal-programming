/**
 * @typedef {import('./logic.js').ResultVertex} ResultVertex
 * @typedef {import('./logic.js').RestrictionLine} RestrictionLine
 */

export class Graph {
  /**
   * Creates a new Graph object
   * @param {HTMLCanvasElement} canvas
   * @param {object} data The data to be plotted
   * @param {Array<RestrictionLine>} data.lines
   * @param {Array<ResultVertex>} data.vertices
   */
  constructor (canvas, data) {
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
    this.gcd = greatestCommonDivisor(this.maxX, this.maxY)
    this.wUnit = this.maxX / this.gcd
    this.hUnit = this.maxY / this.gcd
    this.heightInterval = (this.height - this.fHunit) / (this.hUnit + 1)
    this.widthInterval = (this.width - this.fWunit) / (this.wUnit + 1)

    // Redraw graph on window resize
    window.addEventListener('resize', () => {
      this.draw()
    })

    this.draw()
  }

  /**
   * Draws the graph
   */
  draw () {
    // Restore origin so I can clear the canvas like a human being
    this.ctx.restore()
    this.ctx.clearRect(0, 0, this.width, this.height)
    this.initPlot()
    this.drawGrid()
    this.data.lines.forEach(line => this.drawRestriction(line))
    this.graphChart(this.data.vertices)
  }

  /**
   * Initializes the plot drawing the axes
   */
  initPlot () {
    const { ctx, fWunit, width, height, fHunit } = this

    // save state before translating origin
    ctx.save()

    // Traslate origin coordinate to right-bottom side
    // with an space for tags of 1em
    ctx.translate(fWunit, height - fHunit)

    // Prepare lines color and width
    ctx.strokeStyle = 'rgb(0,0,0)'
    ctx.lineWidth = 2

    // Draw X/Y axes
    ctx.beginPath()
    ctx.moveTo(0, -height + fHunit)
    ctx.lineTo(0, 0)
    ctx.lineTo(width, 0)
    ctx.stroke()
  }

  /**
   * Draws the grid based on the calculated units
   */
  drawGrid () {
    const {
      ctx,
      width,
      height,
      fWunit,
      fHunit,
      widthInterval,
      heightInterval,
      gcd
    } = this

    // prepare lines color and width
    ctx.strokeStyle = 'rgb(0,0,0,0.4)'
    ctx.lineWidth = 1

    // Middle of horizontal lines
    const hLineMiddle = (fHunit * 0.25) / 2

    // X axis for tags
    const x = -fWunit

    // Horizontal lines for Y axis
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
    // Y axis for tags
    const y = fHunit / 2
    // Vertical lines for x axis
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
  }

  /**
   * Draws a restriction on the graph
   * @param {RestrictionLine} restriction
   */
  drawRestriction (restriction) {
    const { ctx, width, height, gcd } = this
    const { x1, y1, x2, y2, d } = restriction
    const widthInterval = this.widthInterval / gcd
    const heightInterval = this.heightInterval / gcd

    // Draw function line
    ctx.strokeStyle = 'rgb(0,0,0,1)'
    ctx.beginPath()
    ctx.moveTo(x1 * widthInterval, -(y1 * heightInterval))
    ctx.lineTo(x2 * widthInterval, -(y2 * heightInterval))
    ctx.stroke()

    // Draw accepted plane
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

  graphChart (vectors = []) {
    // Sort objects in array
    vectors.sort((a, b) => a.x - b.x + a.y + b.y)

    const { ctx, gcd } = this
    const widthInterval = this.widthInterval / gcd
    const heightInterval = this.heightInterval / gcd

    // Add style things
    ctx.fillStyle = 'rgb(255,128,0,0.7)'
    ctx.beginPath()

    // Initial dot on the coordinates
    const { x, y } = vectors[0]
    ctx.moveTo(x * widthInterval, -(y * heightInterval))

    // Iterate all coordinates and draw a line between them
    vectors.forEach(interval => {
      const { x, y } = interval
      ctx.lineTo(x * widthInterval, -(y * heightInterval))
    })
    // Close and fill path
    ctx.closePath()
    ctx.fill()

    // Graph point of intersections
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
}

/**
 * Gets font size in pixels
 * @returns Font size
 */
function getFontSize () {
  return Number(
    window
      .getComputedStyle(document.body)
      .getPropertyValue('font-size')
      .match(/\d+/)[0]
  )
}

/**
 * Calculates the GCD between two numbers
 * @param {number} a
 * @param {number} b
 * @returns GCD
 */
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

/**
 * Generates a random RGB color
 * @returns A string representing a RGB color
 */
const getRandomRgbColor = () => {
  const r = Math.random() * 255
  const g = Math.random() * 255
  const b = Math.random() * 255
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Gets the max values of an object array two properties
 * @param {Array<object>} array
 * @param {string} a
 * @param {string} b
 * @returns An array with the max of two properties of an object array
 */
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

export { greatestCommonDivisor, getRandomRgbColor, getFontSize, maxMax }
