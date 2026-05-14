import { apiGet, apiWrite } from "./api";
import type { CatalogoSimple, PagoDesdeCuenta, PagoDesdeCuentaUpsert } from "../types/tesoreria";

export const getPagosDesdeCuenta = () =>
  apiGet<PagoDesdeCuenta[]>("/tesoreria/pagos-desde-cuenta");

export const createPagoDesdeCuenta = (payload: PagoDesdeCuentaUpsert) =>
  apiWrite<PagoDesdeCuenta>("/tesoreria/pagos-desde-cuenta", "POST", payload);

export const updatePagoDesdeCuenta = (id: number, payload: PagoDesdeCuentaUpsert) =>
  apiWrite<PagoDesdeCuenta>(`/tesoreria/pagos-desde-cuenta/${id}`, "PUT", payload);

export const deletePagoDesdeCuenta = (id: number) =>
  apiWrite<void>(`/tesoreria/pagos-desde-cuenta/${id}`, "DELETE");

export const getCuentasPago = () =>
  apiGet<CatalogoSimple[]>("/tesoreria/catalogos/cuentas");

export const getResponsablesPago = () =>
  apiGet<CatalogoSimple[]>("/tesoreria/catalogos/responsables");

export const getRubrosPago = () =>
  apiGet<CatalogoSimple[]>("/tesoreria/catalogos/rubros");

export const getPeriodosPago = () =>
  apiGet<CatalogoSimple[]>("/tesoreria/catalogos/periodos");
