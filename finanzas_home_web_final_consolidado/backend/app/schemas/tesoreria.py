from pydantic import BaseModel, Field

class CatalogoSimpleOut(BaseModel):
    id: int
    nombre: str
    codigo: str | None = None

class PagoDesdeCuentaOut(BaseModel):
    id: int
    fecha: str
    cuentaOrigen: str
    cuentaOrigenId: int | None = None
    pagadoA: str | None = None
    responsable: str | None = None
    responsableId: int | None = None
    rubroClasificacion: str | None = None
    rubroClasificacionId: int | None = None
    rubroAplicado: str | None = None
    rubroAplicadoId: int | None = None
    periodo: str | None = None
    periodoId: int | None = None
    descripcion: str | None = None
    monto: float
    referenciaExterna: str | None = None

class PagoDesdeCuentaUpsertIn(BaseModel):
    fecha: str
    cuentaOrigenId: int = Field(gt=0)
    pagadoA: str | None = None
    responsableId: int | None = None
    rubroClasificacionId: int | None = None
    rubroAplicadoId: int | None = None
    periodoId: int | None = None
    descripcion: str | None = None
    monto: float = Field(gt=0)
    referenciaExterna: str | None = None
