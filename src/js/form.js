// imports
import Graph from './graphic.js'
import { axes, getIntersections, resolveFnObjective } from './logic.js'
/**
 * @typedef {import('./logic.js').Data} Data
 */

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
