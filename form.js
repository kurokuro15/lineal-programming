// imports
import {
  resolveFnObjective,
  resolveProblem,
  getIntersections,
  pairing,
  coorValidation,
  round,
  ejes
} from './logic.js'
import { initCanvas, maxMax, graphFn, graphChart } from './graphic.js'
/**
 * @typedef {import('./logic.js').Data} Data
 */

// selector de elementos
let container = ''
let form = ''
let graph = ''
document.addEventListener('DOMContentLoaded', () => {
  container = document.querySelector('#restrictions-container')
  form = document.querySelector('#problem-form')
  form.addEventListener('submit', initByEvent)
  addRestriction()
  addRestriction()
  graph = document.querySelector('#graph')
  graph.width =
      graph.parentElement.parentElement.previousElementSibling.firstElementChild.offsetWidth
    graph.height =
      graph.parentElement.parentElement.previousElementSibling.firstElementChild.offsetHeight
  window.addEventListener('resize', () => {
    graph.width =
      graph.parentElement.parentElement.previousElementSibling.firstElementChild.offsetWidth
    graph.height =
      graph.parentElement.parentElement.previousElementSibling.firstElementChild.offsetHeight
    initByEvent()
  })
  document.querySelector('#btn-add-restriction').addEventListener('click', () => {
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
const data = {
  equations: []
}

// procesa los datos del form al escuchar el evento submit
function initByEvent(event) {
  event?.preventDefault()
  const form = Object.fromEntries(new FormData(event.target || window.form))
  // mapping data from form to data
  Object.keys(form).forEach(key => {
    const [type, index, prop] = key.split('-')
    switch (type) {
      case 'r':
        data.equations[index] = { ...data.equations[index], [prop]: form[key] }
        break
      case 'f':
        data.objFn = { ...data.objFn, [index]: form[key] }
        break
      case 'optimization':
        data.maximize = form[key]
        break
    }
  })

  // Calculamos toh acá :V 
  calculatePL(data)

}

// Esta es para calcular la vida entera :v 
function calculatePL(data) {
  const { objFn, equations, maximize } = data

  const axieInter = getIntersections([...equations, ...ejes]).filter(x => x.i2 > 100)
  // console.log(axieInter)
  let axies = []
  for (let i = 0; i < axieInter.length; i += 2) {
    const { x: x1, y: y1, d } = axieInter[i]
    const { x: x2, y: y2 } = axieInter[i + 1]
    axies.push({ x1, y1, x2, y2, d })
  }
  // console.log(axies)
  const [maxX, maxY] = maxMax(axies, 'x2', 'y1')
  const max = { maxX, maxY }
  const context = initCanvas(graph, max)

  // console.log(context)

  axies.forEach(axie => {
    console.log({ ...context, axie })
    graphFn({ ...context, fn: axie })
  })

  const { result } = resolveFnObjective(objFn, equations)
  if (maximize === 'true') {
    result.sort((a, b) => b.z - a.z).push({ x: 0, y: 0, z: 0 })
  } else {
    result.sort((a, b) => a.z - b.z) //.push({x: context.size.width, y: context.size.height, z: Infinity})
  }
  graphChart(context.ctx, context.units, result)
  alert(JSON.stringify(result))
}

// agregar restricciones

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
    restriction.innerHTML += `
      <div class="col-1">
        <button
          type="button"
          class="btn btn-outline-danger"
          id="btn-delete-restriction-${restrictionCount}"
        >X</button>
      </div>
    `
  } else {
    restriction.innerHTML += '<div class="col-1" />'
  }

  container.appendChild(restriction)

  const deleteButton = document.querySelector(
    `#btn-delete-restriction-${restrictionCount}`
  )

  // eliminar la row al hacer clic en el botón de eliminar restricción
  deleteButton?.addEventListener('click', evt => {
    container.removeChild(evt.target.parentElement.parentElement)
    restrictionCount -= 1
  })

  restrictionCount += 1
}

