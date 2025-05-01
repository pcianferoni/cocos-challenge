
# Cocos challenge

Esta API está desarrollada en Nest.js, siguiendo los principios de Domain-Driven Design (DDD), arquitectura hexagonal y Clean Architecture. La idea es desacoplar la lógica de negocio de las distintas implementaciones de infraestructura, en este caso con la DB de Postgres.

Antes de arrancar, deberá establecer las variables de entorno. Hay un archivo .env.example donde podrá encontrar las variables necesarias para iniciar la aplicación. Podrá iniciar la aplicación apuntando a una DB externa, o levantar tanto la DB como la aplicación localmente, mediante contenedores de Docker.
## Conexión a una DB externa

Para conectarse a una DB externa, setear el valor de ```DATABASE_URL``` que corresponda.

Luego ejecute ```npm run start```


Para levantar la aplicación localmente, ejecutar ```docker compose up```

Esto generará dos contenedores, una con postgres y la otra con la aplicación propiamente dicha.


## Levantar localmente con DB dockerizada

Para levantar la aplicación localmente, ejecutar ```docker compose up```

Esto generará dos contenedores, una con postgres y la otra con la aplicación propiamente dicha.

La aplicación por defecto se levantará en el puerto establecido mediante la variable de entorno ```PORT```


## Correr tests

Para correr los tests ejecutar ```npm run test```


## API Reference

### Get portfolio

```http
  GET /portfolio
```

| Parameter    | Type     | Description                                         |
| :----------- | :------- | :-------------------------------------------------- |
| `userId` HEADER     | `number` | **Required**. ID of the user whose portfolio is being requested |

Obtiene el balance actual y las posiciones del usuario.

### Get instruments

```http
  GET /instrument
```

| Parameter    | Type     | Description                                         |
| :----------- | :------- | :-------------------------------------------------- |
| `name`       | `string` | **Optional**. Filter instruments by name            |
| `ticker`     | `string` | **Optional**. Filter instruments by ticker symbol   |

Obtiene el listado de activos. Puede aplicarse filtros de búsqueda tales como el nombre o el ticker.

### Create order

```http
POST /order
```

| Parameter     | Type      | Description                                               |
| :------------ | :-------- | :-------------------------------------------------------- |
| `userId` HEADER| `number`  | **Required**. ID of the user                             |
| `instrumentid`| `number`  | **Required**. The instrument's identifier                |
| `side`        | `string`  | **Required**. `"BUY"` or `"SELL"`                        |
| `type`        | `string`  | **Required**. `"MARKET"` or `"LIMIT"`                    |
| `size`        | `number`  | **Required**. Number of assets to buy/sell               |
| `amount`      | `number`  | **Required** for money-based orders                      |
| `isSizeBased` | `boolean` | **Required**. Whether the order is size or money-based   |

Crea una order.

### Cancel order


```http
DELETE /order/:id
```
| Parameter | Type     | Description                                  |
| :-------- | :------- | :------------------------------------------- |
| `id`      | `number` | **Required**. ID of the order to be canceled |

Cancela una order de tipo 'LIMIT' previamente creada.
# Creación de orden

Se puede pueden generar órdenes de dos tipos, "MARKET" y "LIMIT". 

### Si es MARKET:

Puede ser compra (`side:BUY`) o venta (`side:SELL`).

#### Cuando es de side BUY:


Se crea una order de `type=MARKET`, con `side=BUY` y a la vez, se crea otra de `type=MARKET`, con `side=CASHOUT`.
Esto será permitido siempre y cuando el usuario tenga el monto disponible en pesos suficiente para la compra de los activos. En caso de que no se cuente con los fondos necesarios, se generará una orden con status `REJECTED`

La orden de compra puede generarse en base al campo Size, que indicará la cantidad del activo seleccionado que se desea comprar. O bien se podrá ingresar la cantidad de pesos que se deseen comprar (campo `amount`), es decir, la cantidad de activos será la máxima posible para la cantidad ingresada.

El método con el que se determinará la cantidad de compra se definirá con el campo isSizeBased.

`"isSizeBased=true"` > Se determinará la cantidad en base al campo size

`"isSizeBased=false"` > Se determinará la cantidad en base al amount ingresado


#### Cuando es de side SELL

Se crea una orden de `type=MARKET`, con `side=SELL` y a la vez, se crea otra de `type=MARKET`, con `side=CASHIN` con el monto en pesos total de la venta.
Esto será permitido siempre y cuando el usuario tenga la cantidad de activos disponibles en su haber.


### Si es LIMIT:

Se creará una order de `type=LIMIT` con `status=NEW` , con `side=BUY`o `side=SELL` y a la vez, se creará otra de `side=CASHOUT` (si es BUY) o `side=CASHIN` (si es venta). 
Se podrá cancelar la orden mediante el endpoint `DELETE /order/:id` 
