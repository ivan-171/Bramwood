# Bramwood v0.2

Juego narrativo de gestión para navegador/PWA. No usa servidor, API ni conexión con IA. Todo el estado de la partida se guarda localmente en el navegador y puede exportarse/importarse como JSON.

## Publicar en GitHub Pages

1. Sube **el contenido de esta carpeta** a la raíz de un repositorio (debe quedar `index.html` en la raíz).
2. GitHub → **Settings → Pages**.
3. En **Build and deployment**, elige **Deploy from a branch**.
4. Branch: `main`. Folder: `/ (root)`.
5. Abre la URL que GitHub Pages genere.

## Instalar en iPhone

Abre la URL con Safari → Compartir → **Añadir a pantalla de inicio**. Tras una primera carga online, el service worker mantiene los archivos principales disponibles offline.

## Guardados

- Guardado automático: `localStorage`, clave `bramwood_save_v3`.
- Migra automáticamente partidas de `bramwood_save_v2` y `bramwood_v01`.
- La pestaña Crónica permite exportar/importar un JSON de partida.

## Contenido v0.2

- 107 eventos narrativos.
- 321 decisiones escritas.
- 15 proyectos de construcción.
- 14 líneas narrativas/sistemas.
- Estaciones, clima, producción y consumo diarios.
- Personajes persistentes, hogares, facciones y relaciones.
- Eventos con plazos y consecuencias por no atenderlos.
- Cadenas que dependen de decisiones, recursos, reputación, edificios, personajes vivos y época del año.
- Campaña abierta; el primer año genera un hito narrativo pero la partida puede continuar.

## Tests

Con Node instalado:

```bash
node tests/game.test.js
```
