# Skills técnicas del proyecto Finanzas_Home

## Objetivo técnico general
Migrar la solución local actual de Finanzas_Home a una solución web con los menores cambios posibles en funcionalidad y comportamiento.

## Stack objetivo
### Frontend
- React
- TypeScript
- Vite
- MUI
- React Query
- React Router

### Backend
- FastAPI
- SQLAlchemy sólo como capa de conexión simple si hace falta
- pyodbc hacia SQL Server
- misma BBDD existente

### Base de datos
- SQL Server
- misma base actual del sistema de escritorio / Python

## Principios técnicos del proyecto
- Mantener funcionalidad lo más idéntica posible al sistema actual.
- No rehacer la lógica de negocio sin necesidad.
- Preferir reutilizar nombres de entidades, catálogos y conceptos ya existentes.
- Minimizar cambios de modelo.
- Evitar crear una arquitectura excesivamente abstracta.
- Si una pantalla falla, primero corregir formato, mapeo y conexión antes de rediseñar.

## Reglas técnicas de trabajo
- No crear proyectos paralelos ni carpetas duplicadas.
- Trabajar sobre el árbol existente.
- Hacer cambios incrementales y comprobables.
- Cada corrección debe dejar evidencia clara de:
  - archivo modificado
  - causa raíz
  - impacto esperado
- No asumir que un placeholder equivale a integración real.
- Si una pantalla usa combos, los combos deben venir desde tablas maestras reales del sistema.

## Estructura funcional ya definida para web
### Shell
- login base
- layout principal
- menú lateral
- rutas reales

### Módulos contemplados
- Catálogos
- Tesorería / Ingresos
- Tesorería / Movimientos
- Tesorería / Pago de Tarjetas
- Tesorería / Pagos desde cuenta
- Carga Masiva Compras
- Estados TDC
- Balance General
- Cierre Periodo

## Problemas técnicos ya detectados
### Entorno
- Python 3.14 no sirve bien para este backend actual por incompatibilidad de `pydantic-core` y `pyodbc`.
- Para backend local debe usarse Python 3.12.
- En Mac fue necesario instalar:
  - `python@3.12`
  - `unixodbc`
  - `node`

### Frontend
- La app ya levanta.
- El login mock ya funciona.
- El shell carga.
- La pantalla `Tesorería / Pagos desde cuenta` abre.
- Pero no está cargando datos.
- Se ve mensaje:
  - `The string did not match the expected pattern.`

## Hipótesis técnica prioritaria actual
La pantalla `Pagos desde cuenta` probablemente tiene un problema de formato de fecha o de parseo entre:
- frontend (`TextField type="date"`)
- datos retornados por backend
- estado inicial del formulario

Formato esperado por `type="date"`:
- `YYYY-MM-DD`

Formato que parece estar apareciendo visualmente:
- `DD/MM/YYYY`

Eso puede romper render, estado o validación.

## Qué revisar primero
### Frontend
Archivo prioritario:
- `frontend/src/pages/tesoreria/PagosDesdeCuentaPage.tsx`

Revisar:
- estado inicial de `form.fecha`
- cualquier parseo o formato visual de fecha
- valor que recibe el `TextField type="date"`
- uso de strings no ISO
- si algún valor `null` o texto con formato regional entra al input date

### Servicios frontend
- `frontend/src/services/tesoreriaApi.ts`

Revisar:
- shape exacto de respuesta
- si el frontend espera una estructura distinta a la que devuelve backend

### Backend
Archivo prioritario:
- `backend/app/api/v1/endpoints/tesoreria.py`

Revisar:
- endpoint `GET /api/v1/tesoreria/pagos-desde-cuenta`
- endpoints de catálogos usados por los combos
- formato de fecha devuelto en JSON

## Reglas de depuración
- Primero reproducir el error.
- Segundo confirmar si falla en:
  - render frontend
  - parseo de date
  - fetch API
  - mapeo backend → frontend
- Tercero corregir sólo la causa real.
- No tocar reglas de negocio todavía si el fallo es sólo de formato o binding.
- Si hay llamadas en rojo en Network, corregir primero eso.
- Si el backend responde 200 pero el frontend falla, el problema es de mapping o UI.
