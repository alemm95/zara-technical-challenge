# Especificacion funcional: catalogo y carrito

Estado: borrador inicial.

## Objetivo

Construir una tienda responsive de telefonos con catalogo, busqueda remota, detalle configurable y carrito persistente. Esta especificacion se basa en el PDF y en el contrato consultado en la API el 2026-09-28.

## Rutas

- `/`: catalogo de telefonos.
- `/product/[id]`: detalle del telefono seleccionado.
- `/cart`: carrito de compra.

La navegacion global ofrece acceso al inicio y al carrito con el numero de unidades.

## Contrato de API

Todas las llamadas salen del servidor a traves de `src/services/apiClient.ts`. La clave se lee de `PHONES_API_KEY` y se envia en `x-api-key`; la URL base se lee de `PHONES_API_BASE_URL`, con valor `https://prueba-tecnica-api-tienda-moviles.onrender.com`. Ninguna credencial se expone al cliente ni se guarda en Git.

### Listado y busqueda

`GET /products` acepta los parametros opcionales:

- `search`: filtra por nombre o marca en el servidor.
- `limit`: limita el numero de resultados.
- `offset`: desplaza el inicio de resultados.

La respuesta observada es un array de productos resumidos. Cada elemento contiene `id`, `brand`, `name`, `basePrice` e `imageUrl`. La vista inicial solicita `limit=20` y `offset=0`. La busqueda envia `search` a la API; el contador refleja el numero de elementos devueltos para esa consulta.

### Detalle

`GET /products/{id}` devuelve los datos del producto:

- Identidad y precio: `id`, `brand`, `name`, `description`, `basePrice`, `rating`.
- `specs`: pantalla, resolucion, procesador, camaras, bateria, sistema operativo y frecuencia de refresco.
- `colorOptions`: `name`, `hexCode` e `imageUrl` por color.
- `storageOptions`: `capacity` y `price` por almacenamiento.
- `similarProducts`: productos resumidos con identidad, marca, nombre, precio e imagen.

Las imagenes llegan desde `prueba-tecnica-api-tienda-moviles.onrender.com`; Next Image debera permitir este host y el protocolo que usa la API.

## Criterios de aceptacion

### Catalogo

- Mostrar como maximo los primeros 20 telefonos, con imagen, nombre, marca y precio base.
- Buscar por nombre o marca mediante `GET /products?search=...`, sin filtrar localmente el catalogo.
- Mostrar el total de resultados de la respuesta actual.
- Cada tarjeta abre el detalle del producto correspondiente.
- Mostrar estados de carga, error y busqueda sin resultados.

### Detalle

- Mostrar nombre, marca, imagen principal, precio y especificaciones tecnicas.
- Cambiar la imagen al seleccionar otro color.
- Mostrar opciones de color y almacenamiento disponibles para el producto.
- Actualizar el precio seleccionado usando el precio de la opcion de almacenamiento.
- Mantener deshabilitado "Añadir al carrito" hasta que color y almacenamiento esten seleccionados.
- Mostrar productos similares y permitir navegar a su detalle.

### Carrito

- Compartir el estado mediante React Context API y persistirlo en `localStorage`.
- Mostrar imagen, nombre, color, almacenamiento y precio de cada unidad configurada.
- Eliminar una unidad sin afectar las demas.
- Calcular el total a partir de los precios seleccionados.
- Permitir continuar comprando y volver al catalogo.
- Restaurar el carrito al recargar y mostrar un estado vacio cuando no haya productos.

## Requisitos transversales

- Respetar el diseno definido y funcionar en movil, tablet y escritorio.
- Usar `Helvetica, Arial, sans-serif`.
- Usar `next/image` para imagenes SVG y raster; configurar los dominios remotos necesarios.
- Hacer navegables y comprensibles los controles con teclado y lector de pantalla; etiquetar busqueda, selectores, botones y estados.
- Mantener las credenciales solo en variables de entorno del servidor.
- Cubrir logica y flujos principales con pruebas, incluyendo accesibilidad, carga/error y persistencia del carrito.

## Arquitectura prevista

- App Router de Next.js para las rutas.
- Servicios de servidor para catalogo y detalle, reutilizando `apiRequest`.
- Componentes de presentacion para cabecera, tarjetas, grid, selectores, especificaciones y lineas del carrito.
- React Context API para carrito; logica de actualizacion separada en reducer y persistencia encapsulada.
- Biome para lint y formato; Husky para validacion pre-commit; GitHub Actions para chequeo y build.

## Pendiente antes de implementar vistas

- Confirmar idioma final de interfaz. El PDF esta en espanol y el material de referencia incluye textos en ingles.
- El PDF no define un flujo de pago; el checkout queda fuera de alcance hasta confirmacion.
