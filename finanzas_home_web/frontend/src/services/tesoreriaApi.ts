import { apiGet, apiWrite } from "./api";
import type { BalanceGeneral, CatalogoSimple, PagoDesdeCuenta, PagoDesdeCuentaUpsert } from "../types/tesoreria";

export const getPagosDesdeCuenta = (periodoId?: number | "") => {
  const qs = periodoId ? `?periodo_id=${periodoId}` : "";
  return apiGet<PagoDesdeCuenta[]>(`/tesoreria/pagos-desde-cuenta${qs}`);
};

export const createPagoDesdeCuenta = (payload: PagoDesdeCuentaUpsert) =>
  apiWrite<PagoDesdeCuenta>("/tesoreria/pagos-desde-cuenta", "POST", payload);

export const updatePagoDesdeCuenta = (id: number, payload: PagoDesdeCuentaUpsert) =>
  apiWrite<PagoDesdeCuenta>(`/tesoreria/pagos-desde-cuenta/${id}`, "PUT", payload);

export const deletePagoDesdeCuenta = (id: number) =>
  apiWrite<void>(`/tesoreria/pagos-desde-cuenta/${id}`, "DELETE");

export const getBalanceGeneral = (periodoId?: number | "") => {
  const qs = periodoId ? `?periodo_id=${periodoId}` : "";
  return apiGet<BalanceGeneral>(`/tesoreria/balance-general${qs}`);
};

export const getCuentasPago = () =>
  apiGet<CatalogoSimple[]>("/tesoreria/catalogos/cuentas");

export const getResponsablesPago = () =>
  apiGet<CatalogoSimple[]>("/tesoreria/catalogos/responsables");

export const getRubrosPago = () =>
  apiGet<CatalogoSimple[]>("/tesoreria/catalogos/rubros");

export const getPeriodosPago = () =>
  apiGet<CatalogoSimple[]>("/tesoreria/catalogos/periodos");
