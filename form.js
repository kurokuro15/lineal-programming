// imports
import { Graph } from './graphic.js'
import { ejes, getIntersections, resolveFnObjective } from './logic.js'
/**
 * @typedef {import('./logic.js').Data} Data
 */

// selector de elementos
let container = ''
let form = ''
let canvas = ''
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
  document
    .querySelector('#btn-add-restriction')
    .addEventListener('click', () => {
      if (restrictionCount < 4) {
        addRestriction(true)
      } else {
        alert('Máximo 4 restricciones')
      }
    })
})

const mathExpPattern =
  '\\s*[-+]?(\\(*\\s*\\d+([.,]\\d+)?\\s*\\)*\\s*([-+/*]\\s*\\(*\\s*\\d+([.,]\\d+)?\\s*\\)*\\s*)*)'

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

// procesa los datos del form al escuchar el evento submit
function initByEvent (event) {
  event?.preventDefault()

  data = {
    equations: []
  }
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

  // Calculamos toh acá :V
  calculatePL(data)
}

// Esta es para calcular la vida entera :v
function calculatePL (data) {
  const { objFn, equations, maximize } = data

  const axisIntersections = getIntersections([...equations, ...ejes]).filter(
    x => x.i2 > 100
  )

  let lines = []
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

  const graph = new Graph(canvas, { lines, vertices })

  showResults(vertices, maximize)
}

/**
 * Muestra los resultados de la operación en la página
 * @param {Array<Result>} results
 */
function showResults (results, maximize) {
  const resultsWrapper = document.getElementById('results-container')
  resultsWrapper.style = ''

  const resultsContainer = document.getElementById('results')

  deleteChilds(resultsContainer)

  results.forEach(({ x, y, z }, i) => {
    const rowNumber = i + 1

    const resultRow = document.createElement('div')
    resultRow.className = 'row'
    resultRow.innerHTML = `
        <div class='col col-2'>${rowNumber}) (${x}, ${y})</div>
        <div class='col col-auto'><div class='vr'></div></div>
        <div class='col col-auto'>Z(${x}, ${y}) = ${z}</div>
    `

    resultsContainer.appendChild(resultRow)
  })

  const operationText = maximize ? 'maximiza' : 'minimiza'

  const bestResultMsg = document.createElement('div')
  bestResultMsg.className = 'col col-auto text-success'
  bestResultMsg.textContent = `<-- Este punto ${operationText} la función objetivo`
  resultsContainer.firstElementChild.appendChild(bestResultMsg)
}

/**
 * Elimina los nodos hijos de un elemento dado
 * @param {HTMLElement} element
 */
function deleteChilds (element) {
  while (element.childElementCount > 0) {
    element.removeChild(element.firstChild)
  }
}

// agregar restricciones
function addRestriction (removable = false) {
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
