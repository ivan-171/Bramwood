# Bramwood v0.5.1 — The Living World (FIX GitHub Pages)

## Despliegue a GitHub Pages

**Arreglo mínimo:** sustituye el archivo `index.html` que esté en la raíz del repositorio por el `index.html` de este ZIP. Ya incluye TODO el código, los estilos, el mapa, los habitantes, eventos y guardado. No depende de `styles.css`, `app.js`, `world.js` ni `engine.js`.

**Despliegue recomendado:** sube los 4 archivos de este ZIP (`index.html`, `sw.js`, `manifest.webmanifest`, `icon.svg`) a la raíz del repositorio, sin carpetas extra.

GitHub → repositorio Bramwood → Code → Add file → Upload files → Confirmar commit. Si hay archivos del juego anterior en el mismo lugar, puedes dejarlos: la nueva página es autónoma y no los utiliza.

Settings → Pages → Deploy from a branch → main / (root). Espera a la publicación y abre `https://ivan-171.github.io/Bramwood/`. Usa Ctrl+F5 o una ventana privada si el navegador conserva una versión antigua en caché. En iPhone cierra y reabre la pestaña o reinstala el acceso directo de la pantalla de inicio si sigue mostrando código antiguo.

## Guardado

Mantiene la clave local del motor disponible: `bramwood-save-v3`, para respetar las partidas de la entrega v0.5 disponible. No se garantiza compatibilidad con la antigua v0.4 original, cuyo código no estaba disponible.

## Offline

Con `sw.js`, el juego puede seguir abriéndose sin conexión después de la primera carga; el trabajador intenta primero la red cuando estás conectado para evitar páginas obsoletas. El juego también funciona si subes únicamente `index.html`, aunque en ese caso no contará con caché offline propia.
