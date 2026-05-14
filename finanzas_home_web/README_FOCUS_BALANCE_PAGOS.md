# Finanzas Home Web - Focus Balance General + Pagos desde Cuenta V1

Cambios realizados:

1. Balance General pasa a ser la pagina principal del sistema.
2. Balance General fue rediseñado como dashboard premium:
   - hero principal
   - KPI cards
   - grafico SVG animado
   - indicador radial de presion mensual
   - compromisos calientes
   - presupuesto vs ejecucion incluyendo CREDITOS y NO_PRESUPUESTADO
3. Pagos desde cuenta fue rediseñado visualmente:
   - hero premium
   - tarjetas KPI calculadas desde datos filtrados
   - formulario CRUD reorganizado
   - filtros por texto y periodo
   - tabla MUI DataGrid estilizada
4. Se mantuvo el CRUD existente de Pagos desde cuenta y sus servicios API.
5. Se ajusto la navegacion para que Balance General sea el inicio.

Build validado:

```bash
cd frontend
npm install
npm run build
```

Resultado: build OK. Vite muestra solo warning de chunk grande, no error.
