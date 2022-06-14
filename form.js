import { resolveProblem } from './index.js'

const mathExpPattern =
  '\\s*[-+]?(\\(*\\s*\\d+([.,]\\d+)?\\s*\\)*\\s*([-+/*]\\s*\\(*\\s*\\d+([.,]\\d+)?\\s*\\)*\\s*)*)'

const form = document.querySelector('#problem-form')

// procesar los datos del form al hacer submit
form.addEventListener('submit', evt => {
  evt.preventDefault()

  const values = Object.fromEntries(new FormData(form))

  const data = {
    objFn: { i: 0, d: 0 },
    restrictions: [],
    maximize: null
  }

  Object.keys(values).forEach(key => {
    const propName = key.split('-')

    switch (propName[0]) {
      case 'r':
        data.restrictions[propName[1]] = {
          ...data.restrictions[propName[1]],
          [propName[2]]: Number(eval(values[key]))
        }
        break
      case 'f':
        data.objFn = {
          ...data.objFn,
          [propName[1]]: Number(eval(values[key]))
        }
        break
      case 'optimization':
        data.maximize = Number(values[key])
        break
    }
  })

  console.log(data)

  const result = resolveProblem(data.objFn, data.restrictions, data.maximize)

  alert(`La solución óptima es: x = ${result.x}, y = ${result.y} con z = ${result.z}`)
})

// agregar restricciones
let restrictionCount = 0
const container = document.querySelector('#restrictions-container')
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

// por defecto, iniciar con dos restricciones
addRestriction()
addRestriction()

document.querySelector('#btn-add-restriction').addEventListener('click', () => {
  if (restrictionCount < 4) {
    addRestriction(true)
  } else {
    alert('Máximo 4 restricciones')
  }
})
