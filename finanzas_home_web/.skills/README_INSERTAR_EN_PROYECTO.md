# Pack de skills y prompt para Codex

Este paquete contiene:
- `SKILLS_TECNICAS.md`
- `SKILLS_REGLAS_NEGOCIO.md`
- `PROMPT_CODEX_DEBUG_WEB.md`

## Uso recomendado
1. Copia estos archivos a la raíz del proyecto web.
2. Abre un chat nuevo en Codex dentro de VS Code.
3. Pega primero el contenido de:
   - `SKILLS_TECNICAS.md`
   - `SKILLS_REGLAS_NEGOCIO.md`
4. Luego pega `PROMPT_CODEX_DEBUG_WEB.md`.
5. Pídele que trabaje sobre el workspace abierto, sin crear un proyecto paralelo.

## Objetivo inmediato
Resolver los problemas de arranque y carga de datos del proyecto web local:
- frontend levanta
- backend levanta
- pantalla `Tesorería / Pagos desde cuenta` abre
- pero no carga datos y muestra error de formato:
  - `The string did not match the expected pattern.`
