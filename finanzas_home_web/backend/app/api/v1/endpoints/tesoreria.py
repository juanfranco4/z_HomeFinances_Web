from fastapi import APIRouter, HTTPException, Response, Query
from sqlalchemy import text
from app.core.database import engine
from app.schemas.tesoreria import (
    BalanceCuentaOut,
    BalanceGeneralOut,
    BalanceMonedaOut,
    CatalogoSimpleOut,
    DeudaTarjetaOut,
    PagoDesdeCuentaOut,
    PagoDesdeCuentaUpsertIn,
    PresupuestoResumenOut,
    PresupuestoRubroOut,
    TarjetaResumenOut,
)

router = APIRouter()


def _pago_from_row(row) -> PagoDesdeCuentaOut:
    d = dict(row)
    return PagoDesdeCuentaOut(
        id=d["PagoDesdeCuentaId"],
        fecha=str(d["FechaPago"]),
        cuentaOrigen=d["NombreCuenta"],
        cuentaOrigenId=d["CuentaFinancieraId"],
        pagadoA=d["PagadoA"],
        responsable=d["ResponsableNombre"],
        responsableId=d["ResponsableDeudaId"],
        rubroClasificacion=d["RubroClasificacionNombre"],
        rubroClasificacionId=d["RubroClasificacionId"],
        rubroAplicado=d["RubroAplicadoNombre"],
        rubroAplicadoId=d["RubroAplicadoId"],
        periodo=d["CodigoPeriodo"],
        periodoId=d["PeriodoId"],
        descripcion=d["Descripcion"],
        monto=float(d["Monto"]),
        referenciaExterna=d.get("ReferenciaExterna"),
        observacion=d.get("Observacion"),
        activo=bool(d.get("Activo", True)),
    )


PAGO_SELECT_SQL = """
    SELECT
        v.PagoDesdeCuentaId,
        p.CuentaFinancieraId,
        v.FechaPago,
        p.PeriodoId,
        v.CodigoPeriodo,
        p.ResponsableDeudaId,
        v.ResponsableNombre,
        p.RubroClasificacionId,
        v.RubroClasificacionNombre,
        p.RubroAplicadoId,
        v.RubroAplicadoNombre,
        v.NombreCuenta,
        v.PagadoA,
        v.Descripcion,
        v.Monto,
        v.ReferenciaExterna,
        v.Observacion,
        v.Activo,
        p.MovimientoCuentaId
    FROM fin.vw_PagoDesdeCuenta v
    INNER JOIN fin.PagoDesdeCuenta p ON p.PagoDesdeCuentaId = v.PagoDesdeCuentaId
"""


@router.get("/catalogos/cuentas", response_model=list[CatalogoSimpleOut])
def listar_cuentas():
    sql = text("""
        SELECT cf.CuentaFinancieraId AS id,
               CONCAT(cf.NombreCuenta, ' · ', ef.Nombre, ' · ', m.Codigo) AS nombre,
               CAST(cf.CuentaFinancieraId AS varchar(20)) AS codigo
        FROM fin.CuentaFinanciera cf
        INNER JOIN fin.EntidadFinanciera ef ON ef.EntidadFinancieraId = cf.EntidadFinancieraId
        INNER JOIN fin.Moneda m ON m.MonedaId = cf.MonedaId
        WHERE cf.Activo = 1 AND cf.PermitePagos = 1
        ORDER BY cf.NombreCuenta
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]


@router.get("/catalogos/responsables", response_model=list[CatalogoSimpleOut])
def listar_responsables():
    sql = text("""
        SELECT ResponsableDeudaId AS id, Nombre AS nombre, Codigo AS codigo
        FROM fin.ResponsableDeuda
        WHERE Activo = 1
        ORDER BY Nombre
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]


@router.get("/catalogos/rubros", response_model=list[CatalogoSimpleOut])
def listar_rubros():
    sql = text("""
        SELECT RubroId AS id,
               CONCAT(Nombre, CASE WHEN EsEspecial = 1 THEN ' · especial' ELSE '' END) AS nombre,
               Codigo AS codigo
        FROM fin.RubroPresupuestario
        WHERE Activo = 1
        ORDER BY EsEspecial DESC, OrdenVisual, Nombre
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]


@router.get("/catalogos/periodos", response_model=list[CatalogoSimpleOut])
def listar_periodos():
    sql = text("""
        SELECT PeriodoId AS id, CodigoPeriodo AS nombre, CodigoPeriodo AS codigo
        FROM fin.PeriodoMensual
        ORDER BY CodigoPeriodo DESC
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]


@router.get("/catalogos/tarjetas", response_model=list[CatalogoSimpleOut])
def listar_tarjetas():
    sql = text("""
        SELECT TarjetaCreditoId AS id, NombreTarjeta AS nombre, Ultimos4Digitos AS codigo
        FROM fin.TarjetaCredito
        WHERE Activo = 1
        ORDER BY NombreTarjeta
    """)
    with engine.connect() as conn:
        rows = conn.execute(sql).mappings().all()
    return [CatalogoSimpleOut(**dict(r)) for r in rows]


@router.get("/pagos-desde-cuenta", response_model=list[PagoDesdeCuentaOut])
def listar_pagos_desde_cuenta(periodo_id: int | None = None, activo: bool = True):
    where = " WHERE p.Activo = :activo "
    params = {"activo": activo}
    if periodo_id:
        where += " AND p.PeriodoId = :periodo_id "
        params["periodo_id"] = periodo_id
    sql = text(PAGO_SELECT_SQL + where + " ORDER BY v.FechaPago DESC, v.PagoDesdeCuentaId DESC")
    with engine.connect() as conn:
        rows = conn.execute(sql, params).mappings().all()
    return [_pago_from_row(r) for r in rows]


@router.post("/pagos-desde-cuenta", response_model=PagoDesdeCuentaOut)
def crear_pago_desde_cuenta(payload: PagoDesdeCuentaUpsertIn):
    sql = text("""
        EXEC fin.usp_RegistrarPagoDesdeCuenta
            @CuentaFinancieraId = :cuenta,
            @FechaPago = :fecha,
            @PeriodoId = :periodo,
            @ResponsableDeudaId = :responsable,
            @RubroClasificacionId = :rubro_clasificacion,
            @RubroAplicadoId = :rubro_aplicado,
            @PagadoA = :pagado_a,
            @Descripcion = :descripcion,
            @Monto = :monto,
            @ReferenciaExterna = :referencia,
            @Observacion = :observacion;
    """)
    params = {
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
        "observacion": payload.observacion,
    }
    with engine.begin() as conn:
        conn.execute(sql, params)
        row = conn.execute(text(PAGO_SELECT_SQL + """
            WHERE p.CuentaFinancieraId = :cuenta
              AND p.FechaPago = :fecha
              AND p.PeriodoId = :periodo
              AND p.ResponsableDeudaId = :responsable
              AND p.RubroClasificacionId = :rubro_clasificacion
              AND p.RubroAplicadoId = :rubro_aplicado
              AND p.Monto = :monto
              AND p.Activo = 1
            ORDER BY p.PagoDesdeCuentaId DESC
        """), params).mappings().first()
    if not row:
        raise HTTPException(status_code=500, detail="El pago se registró, pero no pudo recuperarse desde fin.vw_PagoDesdeCuenta.")
    return _pago_from_row(row)


@router.put("/pagos-desde-cuenta/{pago_id}", response_model=PagoDesdeCuentaOut)
def actualizar_pago_desde_cuenta(pago_id: int, payload: PagoDesdeCuentaUpsertIn):
    """Actualización consistente: actualiza PagoDesdeCuenta y su MovimientoCuenta asociado."""
    with engine.begin() as conn:
        current = conn.execute(text("""
            SELECT PagoDesdeCuentaId, MovimientoCuentaId
            FROM fin.PagoDesdeCuenta
            WHERE PagoDesdeCuentaId = :id AND Activo = 1
        """), {"id": pago_id}).mappings().first()
        if not current:
            raise HTTPException(status_code=404, detail="Pago desde cuenta no encontrado o inactivo.")

        conn.execute(text("""
            UPDATE fin.PagoDesdeCuenta
            SET CuentaFinancieraId = :cuenta,
                FechaPago = :fecha,
                PeriodoId = :periodo,
                ResponsableDeudaId = :responsable,
                RubroClasificacionId = :rubro_clasificacion,
                RubroAplicadoId = :rubro_aplicado,
                PagadoA = :pagado_a,
                Descripcion = :descripcion,
                Monto = :monto,
                ReferenciaExterna = :referencia,
                Observacion = :observacion,
                UpdatedAt = SYSDATETIME()
            WHERE PagoDesdeCuentaId = :id
        """), {
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
            "observacion": payload.observacion,
        })

        conn.execute(text("""
            UPDATE mc
            SET mc.CuentaFinancieraId = :cuenta,
                mc.MonedaId = cf.MonedaId,
                mc.FechaMovimiento = :fecha,
                mc.FechaContable = :fecha,
                mc.Monto = :monto,
                mc.Signo = -1,
                mc.Descripcion = :descripcion,
                mc.ReferenciaExterna = :referencia,
                mc.UpdatedAt = SYSDATETIME()
            FROM fin.MovimientoCuenta mc
            INNER JOIN fin.CuentaFinanciera cf ON cf.CuentaFinancieraId = :cuenta
            WHERE mc.MovimientoCuentaId = :mov_id
        """), {
            "mov_id": current["MovimientoCuentaId"],
            "fecha": payload.fecha,
            "cuenta": payload.cuentaOrigenId,
            "descripcion": payload.descripcion,
            "monto": payload.monto,
            "referencia": payload.referenciaExterna,
        })

        row = conn.execute(text(PAGO_SELECT_SQL + " WHERE p.PagoDesdeCuentaId = :id"), {"id": pago_id}).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Pago desde cuenta no encontrado.")
    return _pago_from_row(row)


@router.delete("/pagos-desde-cuenta/{pago_id}", status_code=204)
def eliminar_pago_desde_cuenta(pago_id: int):
    """Borrado lógico consistente: desactiva el pago y el movimiento asociado."""
    with engine.begin() as conn:
        row = conn.execute(text("""
            SELECT MovimientoCuentaId
            FROM fin.PagoDesdeCuenta
            WHERE PagoDesdeCuentaId = :id AND Activo = 1
        """), {"id": pago_id}).mappings().first()
        if not row:
            raise HTTPException(status_code=404, detail="Pago desde cuenta no encontrado o ya inactivo.")
        conn.execute(text("UPDATE fin.PagoDesdeCuenta SET Activo = 0, UpdatedAt = SYSDATETIME() WHERE PagoDesdeCuentaId = :id"), {"id": pago_id})
        conn.execute(text("UPDATE fin.MovimientoCuenta SET Activo = 0, UpdatedAt = SYSDATETIME() WHERE MovimientoCuentaId = :mid"), {"mid": row["MovimientoCuentaId"]})
    return Response(status_code=204)


@router.get("/balance-general", response_model=BalanceGeneralOut)
def obtener_balance_general(periodo_id: int | None = Query(default=None)):
    with engine.connect() as conn:
        cuentas = [BalanceCuentaOut(
            cuentaFinancieraId=r["CuentaFinancieraId"],
            entidadFinanciera=r["EntidadFinanciera"],
            tipoCuentaCodigo=r["TipoCuentaCodigo"],
            tipoCuentaNombre=r["TipoCuentaNombre"],
            monedaCodigo=r["MonedaCodigo"],
            monedaNombre=r["MonedaNombre"],
            nombreCuenta=r["NombreCuenta"],
            saldoInicial=float(r["SaldoInicial"]),
            movimientoNeto=float(r["MovimientoNeto"]),
            saldoCalculado=float(r["SaldoCalculado"]),
            fechaSaldoInicial=str(r["FechaSaldoInicial"]) if r["FechaSaldoInicial"] else None,
            activo=bool(r["Activo"]),
        ) for r in conn.execute(text("SELECT * FROM fin.vw_BalanceCuenta WHERE Activo = 1 ORDER BY MonedaCodigo, SaldoCalculado DESC")).mappings().all()]

        monedas = [BalanceMonedaOut(
            monedaCodigo=r["MonedaCodigo"],
            monedaNombre=r["MonedaNombre"],
            saldoTotalMoneda=float(r["SaldoTotalMoneda"]),
        ) for r in conn.execute(text("SELECT * FROM fin.vw_BalancePorMoneda ORDER BY MonedaCodigo")).mappings().all()]

        tarjetas = [TarjetaResumenOut(
            tarjetaCreditoId=r["TarjetaCreditoId"],
            nombreTarjeta=r["NombreTarjeta"],
            monedaId=r.get("MonedaId"),
            cupoCredito=float(r["CupoCredito"]) if r.get("CupoCredito") is not None else None,
            fechaCorteDia=r.get("FechaCorteDia"),
            fechaPagoDia=r.get("FechaPagoDia"),
            deudaTotalBruta=float(r["DeudaTotalBruta"] or 0),
            saldoFavorTotal=float(r["SaldoFavorTotal"] or 0),
            netoTotalPendiente=float(r["NetoTotalPendiente"] or 0),
            proximoPeriodoPendienteId=r.get("ProximoPeriodoPendienteId"),
            proximoPeriodoPendienteCodigo=r.get("ProximoPeriodoPendienteCodigo"),
            proximoPeriodoPendienteSaldo=float(r["ProximoPeriodoPendienteSaldo"]) if r.get("ProximoPeriodoPendienteSaldo") is not None else None,
        ) for r in conn.execute(text("SELECT * FROM fin.vw_TarjetaResumenGeneral ORDER BY NetoTotalPendiente DESC")).mappings().all()]

        deudas = [DeudaTarjetaOut(
            tarjetaCreditoId=r["TarjetaCreditoId"],
            nombreTarjeta=r["NombreTarjeta"],
            monedaCodigo=r["MonedaCodigo"],
            deudaPendiente=float(r["DeudaPendiente"] or 0),
        ) for r in conn.execute(text("SELECT * FROM fin.vw_DeudaPendienteTarjeta ORDER BY DeudaPendiente DESC")).mappings().all()]

        resumen = None
        rubros: list[PresupuestoRubroOut] = []
        if periodo_id:
            try:
                result = conn.execute(text("EXEC fin.usp_ConsultarResumenSituacionPresupuestoPeriodo @PeriodoId = :periodo_id"), {"periodo_id": periodo_id}).mappings().first()
                if result:
                    rd = dict(result)
                    resumen = PresupuestoResumenOut(
                        periodoId=rd.get("PeriodoId") or periodo_id,
                        codigoPeriodo=rd.get("CodigoPeriodo"),
                        montoPresupuestadoTotal=float(rd.get("MontoPresupuestadoTotal") or rd.get("MontoPresupuestado") or 0),
                        montoConsumidoTotal=float(rd.get("MontoConsumidoTotal") or rd.get("MontoConsumido") or 0),
                        saldoDisponibleTotal=float(rd.get("SaldoDisponibleTotal") or rd.get("SaldoDisponible") or 0),
                        porcentajeConsumido=float(rd.get("PorcentajeConsumido") or 0),
                        rubrosSobrepasados=int(rd.get("RubrosSobrepasados") or 0),
                    )
            except Exception:
                resumen = None
            try:
                for r in conn.execute(text("EXEC fin.usp_ConsultarSituacionPresupuestoPeriodo @PeriodoId = :periodo_id"), {"periodo_id": periodo_id}).mappings().all():
                    d = dict(r)
                    rubros.append(PresupuestoRubroOut(
                        periodoId=d.get("PeriodoId") or periodo_id,
                        codigoPeriodo=d.get("CodigoPeriodo"),
                        rubroId=d.get("RubroId"),
                        rubroCodigo=d.get("RubroCodigo") or d.get("Codigo"),
                        rubroNombre=d.get("RubroNombre") or d.get("Nombre"),
                        montoPresupuestado=float(d.get("MontoPresupuestado") or 0),
                        montoConsumido=float(d.get("MontoConsumido") or 0),
                        saldoDisponible=float(d.get("SaldoDisponible") or 0),
                        porcentajeConsumido=float(d.get("PorcentajeConsumido") or 0),
                    ))
            except Exception:
                rubros = []

    return BalanceGeneralOut(cuentas=cuentas, monedas=monedas, tarjetas=tarjetas, deudasTarjetas=deudas, presupuestoResumen=resumen, presupuestoRubros=rubros)
