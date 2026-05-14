# Skills de reglas de negocio del proyecto Finanzas_Home

## Principio general del sistema
Finanzas_Home es un sistema de finanzas personales con lógica propia, construido desde cero, donde la base de datos y la lógica del negocio son el centro del sistema.

## Premisas funcionales principales
- El sistema debe controlar presupuesto, cuentas, tarjetas, créditos, movimientos, ingresos y balances.
- Todo debe soportarse sobre SQL Server.
- La web debe respetar las definiciones ya cerradas en el proyecto original.

## Modelo de operación general
### Presupuesto
- Existe presupuesto mensual por rubro.
- Todos los pagos deben afectar el presupuesto.

### Cuentas
- Hay cuentas de ahorro.
- Hay cuentas corrientes.
- Hay cuentas de efectivo e inversión según catálogo.
- Las cuentas corrientes son las que normalmente soportan pagos de tarjetas y créditos.

### Tarjetas de crédito
- Muchas compras se hacen con TDC.
- Deben existir vistas de estado, detalle, cuotas y pagos.
- El sistema distingue deuda total vs cuota del período.

### Créditos
- Todo lo cargado por créditos debe caer en el rubro de créditos.
- Eso fue definido de forma explícita.

### Ingresos
- Falta integrarlos completamente en varios flujos, pero existen como módulo obligatorio del sistema.

### Balance
- Debe existir balance de cuentas.
- Al pagar tarjeta o transferir entre cuentas debe reflejarse correctamente el balance.

## Reglas de negocio importantes ya conversadas
### Estados TDC
Para cabeceras por tarjeta:
- `Monto Total` = suma de montos totales del detalle
- `Monto Cuota` = suma de montos cuota del detalle del período

No son lo mismo.
Si cabecera muestra `Monto Total = Monto Cuota` en un período específico, es una regresión.

### Balance por cuenta / balance por moneda
La lógica correcta es acumulativa por período:
- primer período: saldo inicial + ingresos / movimientos del período
- siguiente período: al saldo acumulado anterior se suman movimientos del nuevo período
- repetir hacia adelante

Además:
- para cuentas CLP debe haber total por período
- luego se contrasta con gasto real
- `saldo real del mes = saldo por cuenta - gasto del período`

### Balance General / Detalle del período
Se agregó en tabla de agrupación un nivel superior:
- `clasificacion` en la tabla de agrupación de rubros

La vista debe soportar:
- total por clasificación
- posibilidad de expandir y ver rubros hijos

### Carga masiva compras
Se pidió:
- carga parcial
- edición de ciertos campos antes de procesar
- validación sólo de registros seleccionados
- combos alimentados por tablas maestras reales

### Pagos desde cuenta
La pantalla web debe permitir:
- listar
- crear
- editar
- eliminar
- combos de:
  - cuentas
  - responsables
  - rubros
  - períodos

Todavía puede faltar:
- amarre con `MovimientoCuenta`
- impacto real en presupuesto

## Regla metodológica clave
Si aparece un error técnico en una pantalla nueva, no asumir de inmediato que la regla de negocio está mal.

Orden correcto:
1. validar formato y binding
2. validar fetch y shape de datos
3. validar query
4. recién después validar lógica de negocio

## Regla de continuidad del proyecto
- No perder contexto ya cerrado.
- No reinterpretar definiciones funcionales que ya fueron fijadas.
- Antes de cambiar una lógica, revisar si ya existe una definición previa explícita.
