export type CatalogoSimple = {
  id: number;
  codigo?: string;
  nombre: string;
};

export type PagoDesdeCuenta = {
  id: number;
  fecha: string;
  cuentaOrigen: string;
  cuentaOrigenId: number;
  pagadoA: string;
  responsable: string;
  responsableId: number;
  rubroClasificacion: string;
  rubroClasificacionId: number;
  rubroAplicado: string;
  rubroAplicadoId: number;
  periodo: string;
  periodoId: number;
  descripcion: string;
  monto: number;
  referenciaExterna: string | null;
  observacion: string | null;
  activo: boolean;
};

export type PagoDesdeCuentaUpsert = {
  fecha: string;
  cuentaOrigenId: number;
  pagadoA: string;
  responsableId: number;
  rubroClasificacionId: number;
  rubroAplicadoId: number;
  periodoId: number;
  descripcion: string;
  monto: number;
  referenciaExterna: string | null;
  observacion: string | null;
};

export type BalanceCuenta = {
  cuentaFinancieraId: number;
  entidadFinanciera: string;
  tipoCuentaCodigo: string;
  tipoCuentaNombre: string;
  monedaCodigo: string;
  monedaNombre: string;
  nombreCuenta: string;
  saldoInicial: number;
  movimientoNeto: number;
  saldoCalculado: number;
  fechaSaldoInicial: string | null;
  activo: boolean;
};

export type BalanceMoneda = {
  monedaCodigo: string;
  monedaNombre: string;
  saldoTotalMoneda: number;
};

export type TarjetaResumen = {
  tarjetaCreditoId: number;
  nombreTarjeta: string;
  monedaId: number | null;
  cupoCredito: number | null;
  fechaCorteDia: number | null;
  fechaPagoDia: number | null;
  deudaTotalBruta: number;
  saldoFavorTotal: number;
  netoTotalPendiente: number;
  proximoPeriodoPendienteId: number | null;
  proximoPeriodoPendienteCodigo: string | null;
  proximoPeriodoPendienteSaldo: number | null;
};

export type DeudaTarjeta = {
  tarjetaCreditoId: number;
  nombreTarjeta: string;
  monedaCodigo: string;
  deudaPendiente: number;
};

export type PresupuestoResumen = {
  periodoId: number | null;
  codigoPeriodo: string | null;
  montoPresupuestadoTotal: number;
  montoConsumidoTotal: number;
  saldoDisponibleTotal: number;
  porcentajeConsumido: number;
  rubrosSobrepasados: number;
};

export type PresupuestoRubro = {
  periodoId: number | null;
  codigoPeriodo: string | null;
  rubroId: number | null;
  rubroCodigo: string | null;
  rubroNombre: string | null;
  montoPresupuestado: number;
  montoConsumido: number;
  saldoDisponible: number;
  porcentajeConsumido: number;
};

export type BalanceGeneral = {
  cuentas: BalanceCuenta[];
  monedas: BalanceMoneda[];
  tarjetas: TarjetaResumen[];
  deudasTarjetas: DeudaTarjeta[];
  presupuestoResumen: PresupuestoResumen | null;
  presupuestoRubros: PresupuestoRubro[];
};
