# BRAMWOOD · THE LIVING WORLD — v0.5

Juego narrativo y de gestión medieval para navegadores modernos, iPhone y GitHub Pages. **Sin servidor, sin base de datos, sin dependencias de ejecución**: HTML, CSS y JavaScript nativos. Se puede instalar como PWA y guardar/importar partidas.

## Qué aporta la versión gráfica

- **Mapa isométrico animado** dibujado directamente en Canvas 2D, sin imágenes externas ni librerías de render. Terreno, bosques, senderos, río, parcelas, casas, graneros, enfermería, canteras, mercado, torres, empalizadas y talleres.
- **Las obras se representan en el mundo**: al construir, aparece el edificio correspondiente; admite múltiples edificios del mismo tipo. La tala excesiva afecta a la densidad visual del bosque.
- **Aldeanos con movimientos animados** que recorren los caminos. Los seis consejeros tienen nombre y oficio, y puedes inspeccionarlos en el mapa.
- **Estaciones** de primavera, verano, otoño e invierno, cada una con su vegetación, suelo y cultivos. **Clima visual** determinista con lluvia, nieve, nubes y viento. El clima es decorativo; el motor sigue calculando el efecto económico del invierno.
- **Interacción táctil**: arrastrar para recorrer, pellizcar para ampliar, tocar edificios, aldeanos y terreno; botones +/−/centrar. Ratón: arrastrar, rueda para zoom y doble clic para centrar.
- **Resumen tras avanzar los días**, con cambios de recursos y hechos de la crónica. Mantiene las vistas de Consejo, Vecinos y Crónica y el motor narrativo de esta base.
- Guardado local, exportar/importar JSON, exportar crónica, precaché offline de los archivos del juego, soporte para pantalla de inicio de iPhone.

## Cómo jugar en GitHub Pages

1. Sube **el contenido de esta carpeta** (no el ZIP sin descomprimir) a la raíz de un repositorio de GitHub.
2. En el repositorio: `Settings` → `Pages` → `Build and deployment` → `Deploy from a branch` → selecciona `main` y `/ (root)`.
3. Abre la URL generada por GitHub Pages. En Safari en el iPhone: `Compartir` → `Añadir a pantalla de inicio`.

Para jugar localmente usa un servidor estático:

```sh
python3 -m http.server 8000
```

Abre `http://localhost:8000`. No basta con abrir `index.html` con doble clic: los módulos JavaScript necesitan un servidor (o GitHub Pages).

## Tests

```sh
npm test
```

No requiere `npm install`. `npm test` valida el motor y el modelo del mundo con Node 20+.

## Guardados, continuidad y limitación importante

Esta versión **parte del motor autónomo local «Bramwood — Memoria y Consecuencias»** que estaba disponible al producir esta entrega: cinco recursos, nueve tipos de construcción, consejeros, acontecimientos encadenados y consecuencias aplazadas. Se conserva exactamente su estructura JSON (`version: 3`) y su clave local (`bramwood-save-v3`), por lo que una partida creada **con esa base** sigue siendo válida al abrir esta versión en el mismo dominio y navegador, o importando el JSON exportado. El motor aquí contiene **21 eventos**; no contiene el catálogo de 221 eventos de la antigua v0.4.

**No se ha podido recuperar el código completo de la v0.4 original**. Por ese motivo, este paquete **no se presenta como migración garantizada** de la v0.4 ni acepta su formato de guardado por defecto. Para unir esta presentación gráfica a la v0.4 auténtica hacen falta sus archivos (`index.html`, scripts de lógica y guardado) o el repositorio. La capa visual vive en `world.js` y puede integrarse conservando aquel motor.

## Organización

- `engine.js` — simulador narrativo y persistencia JSON (formato heredado de la base disponible)
- `world.js` — proyección, decoración, personajes, clima, dibujo Canvas e interacción táctil
- `app.js` — interfaz, decisiones, navegación, mapas y exportaciones
- `index.html`, `styles.css` — interfaz responsive
- `sw.js`, `manifest.webmanifest`, `icon.svg` — instalación PWA
- `tests/*.test.js` — pruebas automáticas del motor y del modelo del mundo

El juego no envía datos, no requiere login, no usa APIs externas. Funciona offline tras una primera visita online en un sitio HTTPS compatible con service workers. En modo «ahorro de movimiento», los personajes y los efectos decorativos aparecen estáticos.
