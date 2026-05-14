# README_RUN - Finanzas Home Web (Balance General + Pagos desde cuenta)

Este runbook deja operativo el proyecto en local con backend FastAPI + frontend Vite, conectado a SQL Server real (`Finanzas_Home`, esquema `fin`).

## 1) Backend

Ruta:

```bash
cd finanzas_home_web/backend
```

### 1.1 Crear entorno virtual (recomendado Python 3.12)

```bash
python3.12 -m venv .venv
source .venv/bin/activate
python -V
```

Nota: con Python 3.14, dependencias como `pyodbc` y `pydantic-core` pueden fallar de compilación.

### 1.2 Instalar dependencias

```bash
pip install -r requirements.txt
```

### 1.3 Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `backend/.env` y completar al menos:

- `DB_SERVER`
- `DB_PORT`
- `DB_NAME=Finanzas_Home`
- `DB_USER`
- `DB_PASSWORD`
- `DB_DRIVER` (ejemplo: `ODBC Driver 18 for SQL Server`)

Opcional:

- `CORS_ORIGINS` (coma separada)

### 1.4 Levantar backend

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Si tu entorno bloquea file watchers, usar sin `--reload`:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 1.5 Validar endpoints clave

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/v1/tesoreria/balance-general
curl http://127.0.0.1:8000/api/v1/tesoreria/pagos-desde-cuenta
```

Estos endpoints están adaptados a objetos reales de SQL Server:

- `fin.vw_BalanceCuenta`
- `fin.vw_BalancePorMoneda`
- `fin.vw_TarjetaResumenGeneral`
- `fin.vw_DeudaPendienteTarjeta`
- `fin.usp_ConsultarResumenSituacionPresupuestoPeriodo`
- `fin.usp_ConsultarSituacionPresupuestoPeriodo`
- `fin.vw_PagoDesdeCuenta`
- `fin.usp_RegistrarPagoDesdeCuenta`

## 2) Frontend

Ruta:

```bash
cd finanzas_home_web/frontend
```

### 2.1 Instalar dependencias

```bash
npm install
```

### 2.2 Configurar entorno frontend

```bash
cp .env.example .env
```

Por defecto el frontend proxea `/api` a `http://127.0.0.1:8000` usando `VITE_API_PROXY_TARGET`.

### 2.3 Levantar frontend

```bash
npm run dev
```

## 3) URLs finales

- Frontend: `http://127.0.0.1:5173`
- Backend API docs: `http://127.0.0.1:8000/docs`
- Health backend: `http://127.0.0.1:8000/health`

## 4) Páginas foco verificadas

- `Balance General` está configurada como página principal (`/`)
- `Pagos desde cuenta` está disponible en navegación (`/tesoreria/pagos-desde-cuenta`)
