from fastapi import APIRouter, HTTPException, Response
from sqlalchemy import text
from app.core.database import engine
from app.schemas.tesoreria import CatalogoSimpleOut, PagoDesdeCuentaOut, PagoDesdeCuentaUpsertIn

router = APIRouter()

def _map_pago(row):
    return PagoDesdeCuentaOut(**dict(row))

@router.get("/catalogos/cuentas", response_model=list[CatalogoSimpleOut])
def listar_cuentas():
    sql = text("SELECT CuentaFinancieraId AS id, NombreCuenta AS nombre FROM fin.CuentaFinanciera WHERE Activo = 1 ORDER BY NombreCuenta")
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]

@router.get("/catalogos/cuentas-transferencia", response_model=list[CatalogoSimpleOut])
def listar_cuentas_transferencia():
    sql = text("SELECT CuentaFinancieraId AS id, NombreCuenta AS nombre FROM fin.CuentaFinanciera WHERE Activo = 1 ORDER BY NombreCuenta")
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]

@router.get("/catalogos/responsables", response_model=list[CatalogoSimpleOut])
def listar_responsables():
    sql = text("SELECT ResponsableDeudaId AS id, Nombre AS nombre, Codigo AS codigo FROM fin.ResponsableDeuda WHERE Activo = 1 ORDER BY Nombre")
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]

@router.get("/catalogos/rubros", response_model=list[CatalogoSimpleOut])
def listar_rubros():
    sql = text("SELECT RubroId AS id, Nombre AS nombre, Codigo AS codigo FROM fin.RubroPresupuestario WHERE Activo = 1 ORDER BY Nombre")
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]

@router.get("/catalogos/periodos", response_model=list[CatalogoSimpleOut])
def listar_periodos():
    sql = text("SELECT PeriodoId AS id, CodigoPeriodo AS nombre, CodigoPeriodo AS codigo FROM fin.PeriodoMensual ORDER BY CodigoPeriodo DESC")
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]

@router.get("/catalogos/tarjetas", response_model=list[CatalogoSimpleOut])
def listar_tarjetas():
    sql = text("SELECT TarjetaId AS id, Nombre AS nombre FROM fin.Tarjeta WHERE Activo = 1 ORDER BY Nombre")
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]

@router.get("/pagos-desde-cuenta", response_model=list[PagoDesdeCuentaOut])
def listar_pagos_desde_cuenta():
    sql = text('''
        SELECT pdc.PagoDesdeCuentaId AS id,
               CONVERT(varchar(10), pdc.FechaPago, 23) AS fecha,
               cf.NombreCuenta AS cuentaOrigen,
               pdc.CuentaFinancieraId AS cuentaOrigenId,
               pdc.PagadoA AS pagadoA,
               rd.Codigo AS responsable,
               pdc.ResponsableDeudaId AS responsableId,
               rc.Codigo AS rubroClasificacion,
               pdc.RubroClasificacionId AS rubroClasificacionId,
               ra.Codigo AS rubroAplicado,
               pdc.RubroAplicadoId AS rubroAplicadoId,
               per.CodigoPeriodo AS periodo,
               pdc.PeriodoId AS periodoId,
               pdc.Descripcion AS descripcion,
               CAST(pdc.Monto AS decimal(18,2)) AS monto,
               pdc.ReferenciaExterna AS referenciaExterna
        FROM fin.PagoDesdeCuenta pdc
        INNER JOIN fin.CuentaFinanciera cf ON cf.CuentaFinancieraId = pdc.CuentaFinancieraId
        LEFT JOIN fin.ResponsableDeuda rd ON rd.ResponsableDeudaId = pdc.ResponsableDeudaId
        LEFT JOIN fin.RubroPresupuestario rc ON rc.RubroId = pdc.RubroClasificacionId
        LEFT JOIN fin.RubroPresupuestario ra ON ra.RubroId = pdc.RubroAplicadoId
        LEFT JOIN fin.PeriodoMensual per ON per.PeriodoId = pdc.PeriodoId
        ORDER BY pdc.FechaPago DESC, pdc.PagoDesdeCuentaId DESC
    ''')
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [_map_pago(r) for r in rows]

@router.post("/pagos-desde-cuenta", response_model=PagoDesdeCuentaOut)
def crear_pago_desde_cuenta(payload: PagoDesdeCuentaUpsertIn):
    sql = text('''
        INSERT INTO fin.PagoDesdeCuenta
            (FechaPago, CuentaFinancieraId, PagadoA, ResponsableDeudaId, RubroClasificacionId, RubroAplicadoId, PeriodoId, Descripcion, Monto, ReferenciaExterna)
        VALUES
            (:fecha, :cuenta, :pagado_a, :responsable, :rubro_clasificacion, :rubro_aplicado, :periodo, :descripcion, :monto, :referencia);
        SELECT CAST(SCOPE_IDENTITY() AS int) AS id;
    ''')
    with engine.begin() as conn:
        row = conn.execute(sql, {
            "fecha": payload.fecha,
            "cuenta": payload.cuentaOrigenId,
            "pagado_a": payload.pagadoA,
            "responsable": payload.responsableId,
            "rubro_clasificacion": payload.rubroClasificacionId,
            "rubro_aplicado": payload.rubroAplicadoId,
            "periodo": payload.periodoId,
            "descripcion": payload.descripcion,
            "monto": payload.monto,
            "referencia": payload.referenciaExterna,
        }).mappings().first()
    if not row:
        raise HTTPException(status_code=500, detail="No se pudo crear el pago desde cuenta.")
    created_id = int(row["id"])
    rows = listar_pagos_desde_cuenta()
    for r in rows:
        if r.id == created_id:
            return r
    raise HTTPException(status_code=404, detail="Pago desde cuenta no encontrado.")

@router.put("/pagos-desde-cuenta/{pago_id}", response_model=PagoDesdeCuentaOut)
def actualizar_pago_desde_cuenta(pago_id: int, payload: PagoDesdeCuentaUpsertIn):
    sql = text('''
        UPDATE fin.PagoDesdeCuenta
        SET FechaPago = :fecha, CuentaFinancieraId = :cuenta, PagadoA = :pagado_a, ResponsableDeudaId = :responsable,
            RubroClasificacionId = :rubro_clasificacion, RubroAplicadoId = :rubro_aplicado, PeriodoId = :periodo,
            Descripcion = :descripcion, Monto = :monto, ReferenciaExterna = :referencia
        WHERE PagoDesdeCuentaId = :id
    ''')
    with engine.begin() as conn:
        conn.execute(sql, {
            "id": pago_id,
            "fecha": payload.fecha,
            "cuenta": payload.cuentaOrigenId,
            "pagado_a": payload.pagadoA,
            "responsable": payload.responsableId,
            "rubro_clasificacion": payload.rubroClasificacionId,
            "rubro_aplicado": payload.rubroAplicadoId,
            "periodo": payload.periodoId,
            "descripcion": payload.descripcion,
            "monto": payload.monto,
            "referencia": payload.referenciaExterna,
        })
    rows = listar_pagos_desde_cuenta()
    for r in rows:
        if r.id == pago_id:
            return r
    raise HTTPException(status_code=404, detail="Pago desde cuenta no encontrado.")

@router.delete("/pagos-desde-cuenta/{pago_id}", status_code=204)
def eliminar_pago_desde_cuenta(pago_id: int):
    with engine.begin() as conn:
        conn.execute(text("DELETE FROM fin.PagoDesdeCuenta WHERE PagoDesdeCuentaId = :id"), {"id": pago_id})
    return Response(status_code=204)
