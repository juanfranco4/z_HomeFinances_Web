# Finanzas Home Web - Focus Balance + Pagos V2 DB Real

Este paquete corrige el paquete V1 para adaptarse a la BBDD real existente `Finanzas_Home`, esquema `fin`.

## Alcance trabajado

Solo se tocaron los dos focos definidos:

1. **Balance General**
2. **Pagos desde cuenta**

## Cambios backend

### Pagos desde cuenta

- El listado ahora lee desde `fin.vw_PagoDesdeCuenta` y cruza contra `fin.PagoDesdeCuenta` para recuperar IDs operativos.
- La creación ya no inserta directo en tabla: ejecuta `fin.usp_RegistrarPagoDesdeCuenta`.
- La actualización mantiene consistencia con `fin.MovimientoCuenta` asociado.
- La eliminación es lógica: desactiva `fin.PagoDesdeCuenta` y su `fin.MovimientoCuenta` relacionado.
- Los campos obligatorios se alinean con la tabla real:
  - `CuentaFinancieraId`
  - `FechaPago`
  - `PeriodoId`
  - `ResponsableDeudaId`
  - `RubroClasificacionId`
  - `RubroAplicadoId`
  - `PagadoA`
  - `Descripcion`
  - `Monto`

### Balance General

Nuevo endpoint:

```txt
GET /api/v1/tesoreria/balance-general?periodo_id=<id opcional>
```

Consume objetos reales:

- `fin.vw_BalanceCuenta`
- `fin.vw_BalancePorMoneda`
- `fin.vw_TarjetaResumenGeneral`
- `fin.vw_DeudaPendienteTarjeta`
- `fin.usp_ConsultarResumenSituacionPresupuestoPeriodo`
- `fin.usp_ConsultarSituacionPresupuestoPeriodo`

## Cambios frontend

### Balance General

- Deja de usar datos mock estáticos.
- Lee saldos, tarjetas, deuda y presupuesto desde el backend real.
- Mantiene estilo visual premium/explosivo.
- Permite seleccionar período para activar resumen presupuestario.

### Pagos desde cuenta

- Formulario ajustado a campos obligatorios reales.
- La creación usa SP mediante backend.
- La eliminación ya no borra físicamente.
- La grilla consume datos reales de la vista.

## Validación

Frontend validado con:

```bash
npm install
npm run build
```

Resultado: build correcto. Solo queda el warning normal de Vite por tamaño de chunk.

Backend validado con:

```bash
python3 -m py_compile backend/app/api/v1/endpoints/tesoreria.py backend/app/schemas/tesoreria.py
```
