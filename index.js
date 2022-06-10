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
 * Función de emparejamiento, recorre el arreglo las veces necesarias
 * para emparejar los elementos de la matriz al una sola vez
 * @param {Array} array any array
 * @param {Function} callback any callback that behavior like map
 * @returns {Array}	mapped matched array
 */
function pairing(array, callback) {
  let result = []
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
    const operation = ((a * x) + (b * y))
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
 * @param {Array<Equation>} conditions
 * @returns {Array<Intersection>} coordenadas de la intersección
 */
function getIntersections(conditions) {
  return pairing(conditions, (r1, r2) => {
    const { a, b, c, i } = r1
    const { a: a2, b: b2, c: c2, i: i2 } = r2
    const y = (a * c2 - a2 * c) / (a * b2 - a2 * b)
    const x = (c - b * y) / a
    if (i !== 0 || i2 !== 0) return { x, y, u: i + i2 }
  })
}

// constantes, "ecuaciones" que representan el corte con el eje X y el eje Y de la gráfica
/**
 * @type {Equation} a - coeficiente; b - coeficiente; c - término independiente; d - sentido de la desigualdad; i - indice de la restricción
 */
const y = { a: 1, b: 0, c: 0, i: 0, d:1 }
/**
 * @type {Equation} a - coeficiente de x; b - coeficiente de y; c - término independiente; d - sentido de la desigualdad; i - indice de la restricción
 */
const x = { a: 0, b: 1, c: 0, i: 0, d:1 }
// array de ecuación X Y
const ejes = [x, y]
// Función objetivo Z = ax + by;
// funcion objetivo  ? = {a:2, b:3}
// formula objetivo = a*x + b*y
// bucle para probar y almacenar los resultados en un array y luego buscar el menor de ellos.
// además he de probar que sean válidos dentro de las restricciones.
// formula de la restricción: r = a*x + b*y  1 >= | <= 2 c

// testing ....
const restricciones = [
  { a: 20, b: 30, c: 6000, i: 1, d: 2 },
  { a: 20, b: 10, c: 4800, i: 2, d: 2 }
]
const maximizar = true
const objFunction = { a: 1.5, b: 1, i: 0, d: 0 }
// Ejercicio de mesas
let mesas = [...restricciones, ...ejes]

//ejercicio random de 3 ecuaciones que no se encuentran interceptadas en el cuadrante I
// r1: 10x+2y >= 150
// a: 10, b:2 , c:150, i:1
let r1 = { a: 10, b: 2, c: 150, i: 1 }
// r2: 2x-8y >= 90
// a: 2, b:8 , c:90, i:1
let r2 = { a: 2, b: -8, c: 90, i: 1 }
// r3: x+y <= 10
// a: 1, b:1 , c:10, i:2
let r3 = { a: 1, b: 1, c: 10, i: 2 }
let r = [r1, r2, r3, x,y]

/**
 * Función para resolver la función objetivo con cada coordenada.
 * Devolviendo un arreglo de objetos con las coordenadas y el valor de Z.
 * @param {Equation} objFunction Objective Function of the problem
 * @param {Array<Equation>} conditions Array of conditions of the problem
 * @returns an array of valid intersections with Z value
 */
function resolveFnObjective(objFunction, conditions) {
  const res = []
	const intersections = getIntersections(conditions)
	intersections.forEach(coordinate => {
		const { x, y } = coordinate
		const { a, b } = objFunction
		const z = a*x + b*y
			if(coorValidation(conditions, x, y)) 
				 res.push({x, y, z})
	})
  return res
}

const results = resolveFnObjective(objFunction, mesas)

if(maximizar) {
  results.sort((a, b) => b.z - a.z)
} else{
  results.sort((a, b) => a.z - b.z)
}

console.log("La Solución optima es:" + JSON.stringify(results[0]))
console.log(results)