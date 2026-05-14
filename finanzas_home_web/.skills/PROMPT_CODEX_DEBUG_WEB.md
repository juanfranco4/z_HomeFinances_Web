Quiero que trabajes directamente sobre el workspace abierto en VS Code, sin crear un proyecto paralelo y sin inventar una nueva arquitectura.

Lee y respeta primero estos dos documentos del proyecto:
- `SKILLS_TECNICAS.md`
- `SKILLS_REGLAS_NEGOCIO.md`

## Objetivo inmediato
Resolver los problemas actuales del proyecto web local, priorizando la pantalla:
- `Tesorería / Pagos desde cuenta`

## Estado actual verificado
### Entorno
- Backend levanta correctamente con Python 3.12
- Frontend levanta correctamente con Vite
- Login mock funciona
- Shell principal funciona
- Navegación lateral funciona

### Problema actual
La pantalla `Tesorería / Pagos desde cuenta` abre, pero no carga datos correctamente y muestra este mensaje:
- `The string did not match the expected pattern.`

Además, visualmente parece haber un problema con el campo fecha.

## Tu misión
Necesito que depures esto en el workspace actual, de forma ordenada y con cambios mínimos.

## Tareas obligatorias
### 1. Reproducir el problema
- levantar frontend y backend
- abrir la pantalla
- confirmar exactamente qué requests se hacen
- confirmar si hay errores en consola o network

### 2. Encontrar la causa raíz
Revisa primero estos archivos:
- `frontend/src/pages/tesoreria/PagosDesdeCuentaPage.tsx`
- `frontend/src/services/tesoreriaApi.ts`
- `backend/app/api/v1/endpoints/tesoreria.py`

Quiero que identifiques si el error viene de:
- formato de fecha incompatible con `type="date"`
- shape JSON incorrecto
- nulls o strings inesperados
- endpoint que devuelve formato incorrecto
- mapping incorrecto entre backend y frontend

### 3. Corregir
Haz la corrección mínima necesaria para que:
- la pantalla cargue sin error
- la grilla cargue
- los combos carguen
- el formulario no rompa el render

### 4. Validar
Después de corregir, valida:
- apertura de pantalla
- carga de combos
- carga de registros
- creación de un registro de prueba si procede
- edición y eliminación si procede

## Reglas estrictas
- No reestructures todo el proyecto.
- No inventes un nuevo stack.
- No generes un proyecto nuevo.
- No reemplaces el módulo por mocks si ya hay endpoint real.
- No cambies reglas de negocio si el error es técnico.
- Si modificas fechas, usa formato compatible con `input type="date"`:
  - `YYYY-MM-DD`

## Formato de respuesta que quiero de ti
1. causa raíz encontrada
2. archivos modificados
3. diff o resumen exacto de los cambios
4. cómo validar manualmente
5. riesgos o cosas aún pendientes

## Prioridad
Quiero resolver primero funcionamiento básico y estabilidad visual de `Pagos desde cuenta`.
Después seguimos con el resto de módulos.
