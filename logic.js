// Declaramos Tipos de variables y algunas funciones importantes.
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

/*constantes, "ecuaciones" que representan el corte con el eje X y el eje Y de la gráfica*/
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
const ejes = [x, y]
/**
 * Función de emparejamiento, recorre el arreglo las veces necesarias
 * para emparejar los elementos de la matriz al una sola vez
 * @param {Array} array any array
 * @param {Function} callback any callback that behavior like map
 * @returns {Array}	mapped matched array
 */
function pairing (array, callback) {
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
function coorValidation (conditions, x, y) {
  const valid = []
  conditions.forEach(el => {
    const { a, b, c, d } = el
    const operation = round(a * x + b * y)
    const equalities = {
      0: operation == c,
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
function getIntersections (equations) {
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
function resolveFnObjective (objFunction, equations) {
  const vertices = []
  const intersections = getIntersections([...equations, ...ejes])
  intersections.forEach(coordinate => {
    const { x, y } = coordinate
    const { a, b } = objFunction
    const z = a * x + b * y
    if (coorValidation(equations, x, y))
      vertices.push({ x: round(x), y: round(y), z: round(z) })
  })
  return { vertices, intersections }
}

function round (number) {
  return Math.round(number * 100) / 100
}

function resolveProblem (objFn, restrictions, maximize) {
  const { result, intersections } = resolveFnObjective(objFn, [
    ...restrictions,
    ...ejes
  ])
  if (maximize) {
    result.sort((a, b) => b.z - a.z)
  } else {
    result.sort((a, b) => a.z - b.z)
  }
  const coordinates = intersections
    .map(equation => {
      if (equation.i < 200) {
        return undefined
      }
      return equation
    })
    .filter(e => e !== undefined)
  return { result, coordinates }
}

export {
  resolveProblem,
  resolveFnObjective,
  getIntersections,
  pairing,
  coorValidation,
  round,
  ejes
}
