/* ####################################################################################### */
/* ###########               Aplanamiento de archivos JavaScript              ############ */
/* ###########   En este archivo se agrupan toda la funcionalidad y lógica    ############ */
/* ###########    de la aplicación web. Solo fue usado para este propósito.   ############ */
/* ###########               No tiene utilidad adicional a esto.              ############ */
/* ####################################################################################### */


/* ####################################################################################### */
/* ########### Declaramos Tipos de variables y algunas funciones importantes. ############ */
/* ####################################################################################### */
/**
 * @typedef {Object} Equation
 * @property {Number} a coeficiente de la x
 * @property {Number} b coeficiente de la y
 * @property {Number} c término independiente
 * @property {Number} d sentido de la desigualdad
 * @property {Number} i indice de la restricción
 *
 */

/**
 * @typedef {Object} Intersection
 * @property {Number} x coordinate x of intersection
 * @property {Number} y coordinate y of intersection
 */

/**
 * @typedef {Object} Data from the form
 * @property {Equation} objFn Object of Objetive Function
 * @property {Array<Equation>} equations Array of Equations
 * @property {boolean} maximize if the PL search maximize or minimize the Objetive Function
 */

/**
 * @typedef {object} RestrictionLine
 * @property {number} x1
 * @property {number} x2
 * @property {number} y1
 * @property {number} y2
 * @property {number} d Direction of the restriction
 */

/**
 * @typedef {object} ResultVertex
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */
/* ####################################################################################### */
/* constantes, "ecuaciones" que representan el corte con el eje X y el eje Y de la gráfica */
/* ####################################################################################### */
/**
 * @type {Equation}
 * {@link Equation}
 */
const x = { a: 1, b: 0, c: 0, i: 330, d: 1 }

/**
 * @type {Equation}
 * {@link Equation}
 */
const y = { a: 0, b: 1, c: 0, i: 770, d: 1 }

/**
 * @type {Array<Equation>}
 * {@link Equation} Array of Equations
 */
const axes = [x, y]

/* ####################################################################################### */
/* ##### Declaración de funciones de la lógica de la programación lineal por gráfica ##### */
/* ####################################################################################### */

/**
 * Función de emparejamiento, recorre el arreglo las veces necesarias
 * para emparejar los elementos de la matriz al una sola vez
 * @param {Array} array any array
 * @param {Function} callback any callback that behavior like map
 * @returns {Array}	mapped matched array
 */
function pairing(array, callback) {
  const result = []
  for (let i = 0; i < array.length; i++) {
    for (let k = 0; k < array.length; k++) {
      if (i === k || i > k) continue
      result.push(callback(array[i], array[k]))
    }
  }
  return result.filter(e => e !== undefined)
}

/**
 * Función para validar las coordenadas.
 * Será True siempre que se cumplan TODAS las condiciones.
 * @param {Array<Equation>} conditions
 * @param {Number} x
 * @param {Number} y
 * @returns {Boolean}
 */
function coorValidation(conditions, x, y) {
  const valid = []
  conditions.forEach(el => {
    const { a, b, c, d } = el
    const operation = round(a * x + b * y)
    const equalities = {
      0: operation === c,
      1: operation >= c,
      2: operation <= c
    }
    valid.push(equalities[d])
  })
  return valid.every(e => e === true)
}

/**
 * Función para hallar la intercección entre las restricciones
 * recibe un arreglo de objeto con las propiedades a, b, c y i
 * @param {Array<Equation>} equations
 * @returns {Array<Intersection>} coordenadas de la intersección
 */
function getIntersections(equations) {
  return pairing(equations, (r1, r2) => {
    const { a, b, c, i, d } = r1
    const { a: a2, b: b2, c: c2, i: i2 } = r2
    const y = round((a * c2 - a2 * c) / (a * b2 - a2 * b))
    const x = round((c - b * y) / a)
    if (i + i2 !== 1100) return { x, y, i, i2, d }
  })
}

/**
 * Función para resolver la función objetivo con cada coordenada.
 * Devolviendo un arreglo de objetos con las coordenadas y el valor de Z.
 * @param {Equation} objFunction Objective Function of the problem
 * @param {Array<Equation>} equations Array of conditions of the problem
 * @returns an object containing solution vertices and intersections
 */
function resolveFnObjective(objFunction, equations) {
  const vertices = []
  const intersections = getIntersections([...equations, ...axes])
  intersections.forEach(coordinate => {
    const { x, y } = coordinate
    const { a, b } = objFunction
    const z = a * x + b * y
    if (coorValidation(equations, x, y)) {
      vertices.push({ x: round(x), y: round(y), z: round(z) })
    }
  })
  return { vertices, intersections }
}

/**
 * Función para redondear valores a solo dos decimales
 * @param {number} number
 * @returns {number}
 */
function round(number) {
  return Number(number.toFixed(2))
}

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
class Graph {
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

/* ###################################################################################### */
/* ######## Declaración de constantes y selectores para la manipulación de la UI ######## */
/* ###################################################################################### */

/**
 * Constantes
 */

const mathExpPattern =
  '\\s*[-+]?(\\(*\\s*\\d+([.,]\\d+)?\\s*\\)*\\s*([-+/*]\\s*\\(*\\s*\\d+([.,]\\d+)?\\s*\\)*\\s*)*)'
/**
 * Variables mutables
 */

// counter de restricciones
let restrictionCount = 0

/**
 * Global Data Object
 * @type {Data}
 * {@link Data}
 */
let data = {
  equations: []
}

/**
 * Selectores del DOM
 */
let canvas = ''
let container = ''
let form = ''

/**
 * Listener de eventos del DOM, una vez cargado se ejecuta el código
 */
document.addEventListener('DOMContentLoaded', () => {
  container = document.querySelector('#restrictions-container')
  form = document.querySelector('#problem-form')
  form.addEventListener('submit', initByEvent)
  addRestriction()
  addRestriction()

  canvas = document.querySelector('#graph')
  canvas.width =
    canvas.parentElement.parentElement.previousElementSibling.firstElementChild.offsetWidth
  canvas.height =
    canvas.parentElement.parentElement.previousElementSibling.firstElementChild.offsetHeight
  window.addEventListener('resize', () => {
    canvas.width =
      canvas.parentElement.parentElement.previousElementSibling.firstElementChild.offsetWidth
    canvas.height =
      canvas.parentElement.parentElement.previousElementSibling.firstElementChild.offsetHeight
  })

  document.querySelector('#btn-add-restriction').addEventListener('click', () => {
    if (restrictionCount < 4) {
      addRestriction(true)
    } else {
      alert('Máximo 4 restricciones')
    }
  })
})

/* ####################################################################################### */
/* Declaración de funciones para la manipulación de la UI y cálculo de Programación Lineal */
/* ####################################################################################### */

/**
 * Función para procesar los datos del formulario al escuchar el evento submit
 * @param {Event} event
 */
function initByEvent(event) {
  event.preventDefault()

  // 'clean' data object
  data = {
    equations: []
  }
  // get data input from form
  const form = Object.fromEntries(new FormData(event.target || window.form))

  // mapping data from form to data
  Object.keys(form).forEach(key => {
    const [type, index, prop] = key.split('-')
    switch (type) {
      case 'r':
        data.equations[index] = {
          ...data.equations[index],
          [prop]: Number(form[key])
        }
        break
      case 'f':
        data.objFn = { ...data.objFn, [index]: Number(form[key]) }
        break
      case 'optimization':
        data.maximize = !!Number(form[key])
        break
    }
  })

  data.equations = data.equations.filter(e => e)

  // We go to the next step
  calculatePL(data)
}

/**
 * Función para hacer el cálculo de Programación Lineal
 * a través del método gráfico
 * @param {Data} data
 */
function calculatePL(data) {
  const { objFn, equations, maximize } = data

  const axisIntersections = getIntersections([...equations, ...axes]).filter(
    x => x.i2 > 100
  )

  const lines = []

  for (let i = 0; i < axisIntersections.length; i += 2) {
    const { x: x1, y: y1, d } = axisIntersections[i]
    const { x: x2, y: y2 } = axisIntersections[i + 1]
    lines.push({ x1, y1, x2, y2, d })
  }

  const { vertices } = resolveFnObjective(objFn, equations)

  if (maximize) {
    vertices.sort((a, b) => b.z - a.z)
  } else {
    vertices.sort((a, b) => a.z - b.z)
  }

  // draw graph
  new Graph(canvas, { lines, vertices })

  // render results in UI
  showResults(vertices, maximize)
}

/**
 * Función para renderizar los resultados de la operación en la página
 * @param {Array<Result>} results
 */
function showResults(results, maximize) {
  const resultsWrapper = document.getElementById('results-container')
  resultsWrapper.style = ''

  const resultsContainer = document.getElementById('results')

  deleteChilds(resultsContainer)

  results.forEach(({ x, y, z }, i) => {
    const rowNumber = i + 1

    const resultRow = document.createElement('div')
    resultRow.className = 'row'
    let first = i === 0 ? 'bg-success bg-opacity-50' : ''

    resultRow.innerHTML = `
        <div class='col col-2 ${first}'>${rowNumber}) (${x}, ${y})</div>
        <div class='col col-auto ${first}'><div class='vr'></div></div>
        <div class='col col-auto ${first}'>Z(${x}, ${y}) = ${z}</div>
    `

    resultsContainer.appendChild(resultRow)
  })

  const operationText = maximize ? 'maximiza' : 'minimiza'

  const bestResultMsg = document.createElement('div')
  bestResultMsg.className = 'col col-auto text-success'
  bestResultMsg.textContent = `←   Este punto ${operationText} la función objetivo`
  resultsContainer.firstElementChild.appendChild(bestResultMsg)
}

/**
 * Función para añadir campos de restricciones al formulario.
 * Máximo 4 restricciones.
 * @param {Boolean} removable
 */
function addRestriction(removable = false) {
  const restriction = document.createElement('div')
  restriction.className = 'row gx-2 align-items-center mb-3'
  restriction.innerHTML = `
    <div class="col-auto">(${restrictionCount + 1})</div>
    <div class="col">
      <div class="input-group">
        <input
          class="form-control"
          name="r-${restrictionCount}-a"
          id="r-${restrictionCount}-a"
          required
          pattern="${mathExpPattern}"
        />
        <span class="input-group-text">X</span>
      </div>
    </div>
    <div class="col-auto">+</div>
    <div class="col">
      <div class="input-group">
        <input
          class="form-control"
          name="r-${restrictionCount}-b"
          id="r-${restrictionCount}-b"
          required
          pattern="${mathExpPattern}"
        />
        <span class="input-group-text">Y</span>
      </div>
    </div>
    <div class="col-auto">
      <select class="form-select" name="r-${restrictionCount}-d" id="r-${restrictionCount}-d required">
        <option value="2">≤</option>
        <option value="1">≥</option>
      </select>
    </div>
    <div class="col">
      <input
        class="form-control"
        name="r-${restrictionCount}-c"
        id="r-${restrictionCount}-c"
        required
        pattern="${mathExpPattern}"
      />
    </div>
    <input
      name="r-${restrictionCount}-i"
      value="${restrictionCount + 1}"
      hidden
    />
  `

  if (removable) {
    const deleteButton = document.createElement('div')
    deleteButton.className = 'col-1'
    deleteButton.innerHTML = `
      <button
        type="button"
        class="btn btn-outline-danger"
      >X</button>
    `

    // eliminar la row al hacer clic en el botón de eliminar restricción
    deleteButton.addEventListener('click', evt => {
      container.removeChild(evt.target.parentElement.parentElement)
      restrictionCount -= 1
    })
    restriction.appendChild(deleteButton)
  } else {
    restriction.innerHTML += '<div class="col-1" />'
  }

  container.appendChild(restriction)
  restrictionCount += 1
}

/**
 * Elimina los nodos hijos de un elemento dado
 * @param {HTMLElement} element
 */
function deleteChilds(element) {
  while (element.childElementCount > 0) {
    element.removeChild(element.firstChild)
  }
}
