from pydantic import BaseModel, Field

class CatalogoSimpleOut(BaseModel):
    id: int
    nombre: str
    codigo: str | None = None

class PagoDesdeCuentaOut(BaseModel):
    id: int
    fecha: str
    cuentaOrigen: str
    cuentaOrigenId: int
    pagadoA: str
    responsable: str
    responsableId: int
    rubroClasificacion: str
    rubroClasificacionId: int
    rubroAplicado: str
    rubroAplicadoId: int
    periodo: str
    periodoId: int
    descripcion: str
    monto: float
    referenciaExterna: str | None = None
    observacion: str | None = None
    activo: bool = True

class PagoDesdeCuentaUpsertIn(BaseModel):
    fecha: str
    cuentaOrigenId: int = Field(gt=0)
    pagadoA: str = Field(min_length=1, max_length=150)
    responsableId: int = Field(gt=0)
    rubroClasificacionId: int = Field(gt=0)
    rubroAplicadoId: int = Field(gt=0)
    periodoId: int = Field(gt=0)
    descripcion: str = Field(min_length=1, max_length=200)
    monto: float = Field(gt=0)
    referenciaExterna: str | None = None
    observacion: str | None = None

class BalanceCuentaOut(BaseModel):
    cuentaFinancieraId: int
    entidadFinanciera: str
    tipoCuentaCodigo: str
    tipoCuentaNombre: str
    monedaCodigo: str
    monedaNombre: str
    nombreCuenta: str
    saldoInicial: float
    movimientoNeto: float
    saldoCalculado: float
    fechaSaldoInicial: str | None = None
    activo: bool

class BalanceMonedaOut(BaseModel):
    monedaCodigo: str
    monedaNombre: str
    saldoTotalMoneda: float

class TarjetaResumenOut(BaseModel):
    tarjetaCreditoId: int
    nombreTarjeta: str
    monedaId: int | None = None
    cupoCredito: float | None = None
    fechaCorteDia: int | None = None
    fechaPagoDia: int | None = None
    deudaTotalBruta: float
    saldoFavorTotal: float
    netoTotalPendiente: float
    proximoPeriodoPendienteId: int | None = None
    proximoPeriodoPendienteCodigo: str | None = None
    proximoPeriodoPendienteSaldo: float | None = None

class DeudaTarjetaOut(BaseModel):
    tarjetaCreditoId: int
    nombreTarjeta: str
    monedaCodigo: str
    deudaPendiente: float

class PresupuestoResumenOut(BaseModel):
    periodoId: int | None = None
    codigoPeriodo: str | None = None
    montoPresupuestadoTotal: float = 0
    montoConsumidoTotal: float = 0
    saldoDisponibleTotal: float = 0
    porcentajeConsumido: float = 0
    rubrosSobrepasados: int = 0

class PresupuestoRubroOut(BaseModel):
    periodoId: int | None = None
    codigoPeriodo: str | None = None
    rubroId: int | None = None
    rubroCodigo: str | None = None
    rubroNombre: str | None = None
    montoPresupuestado: float = 0
    montoConsumido: float = 0
    saldoDisponible: float = 0
    porcentajeConsumido: float = 0

class BalanceGeneralOut(BaseModel):
    cuentas: list[BalanceCuentaOut]
    monedas: list[BalanceMonedaOut]
    tarjetas: list[TarjetaResumenOut]
    deudasTarjetas: list[DeudaTarjetaOut]
    presupuestoResumen: PresupuestoResumenOut | None = None
    presupuestoRubros: list[PresupuestoRubroOut] = []
