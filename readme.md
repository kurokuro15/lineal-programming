# Lineal Programming Calculator
------
Calculadora de programación lineal a través del método Gráfico, para dos o más restricciones. 

## Pasos de la Programación Lineal por método gráfico (según yo):
### Pasos para calcular la maximización o minimización:
- Se calcula el punto de corte con el eje X y Y de cada gráfica
- Buscamos el corte o intersección entre rectas  R1 = R2, R1 = R3, R2=R3...  Despejando X Y posteriormente Y en una de estas para hallarlo (ej 2x+1 = 6-3x => Y)
- Se sustituye X y Y en la función objetivo y en cada restricción, si cumplen con las restricciones, entonces es una coordenada tentadora como valor optimo
- Una vez realizada la sustitución con todas las posibles coordenadas, se ordenan de mayor a menor o menor a mayor (según sea maximización o minimización) y se destaca la primera. 

### Pasos para Graficar: 
- Se toman las restricciones (desigualdades) y se  plantea su recta. Buscando los puntos de corte X y Y. 
- Se traza la línea entre estos yendo al infinito. Sí, La restricción o desigualdad tiene el símbolo Mayor qué, entonces el área de esta corresponderá su parte superior-derecha,
en caso de que sea el símbolo Menor qué, entonces el área de esta corresponderá con su parte inferior-izquierda. 
- Una vez trazadas las restricciones, se generará un subplano entre las intersecciones de estas (definiendo las vértices del sub-plano solución) y el eje, correspondiendo 
a que sea siempre X >= 0; Y >= 0; Dentro de este sub-plano se hallará la solución. 
- Una vez se calcula los valores optimos de X y Y se graficará la función Objetivo bajo estos valores. Siguiendo la idea de la graficación de restricciones.

## TODO:
#### Tareas pendientes para finalizar el proyecto.
- __Listo__ Cálculos 
	- __Listo__ Emparejamiento de inecuaciones para hallar puntos de corte e intersecciones. 
	- __Listo__ Validación ante restricciones y función objetivo de los puntos de corte e intersecciones halladas.
	- __Pendiente__ Agrupación e identificación de puntos de corte con eje XY para graficación. 

- __Pendiente__ Graficación de funciones
- __Pendiente__ Interface
	- __Pendiente__ Formulario de datos: 
    - __Pendiente__ Función objetivo del tipo : Z =  Ax + By
    - __Pendiente__ N Restricciones del tipo: Rn >= y/o <= Ax + By
    - __Pendiente__ Identificar maximización o minimización

