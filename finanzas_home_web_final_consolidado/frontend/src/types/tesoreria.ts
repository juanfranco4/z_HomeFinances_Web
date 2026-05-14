export type CatalogoSimple = {
  id: number;
  codigo?: string;
  nombre: string;
};

export type PagoDesdeCuenta = {
  id: number;
  fecha: string;
  cuentaOrigen: string;
  cuentaOrigenId?: number;
  pagadoA: string | null;
  responsable: string | null;
  responsableId?: number | null;
  rubroClasificacion: string | null;
  rubroClasificacionId?: number | null;
  rubroAplicado: string | null;
  rubroAplicadoId?: number | null;
  periodo: string | null;
  periodoId?: number | null;
  descripcion: string | null;
  monto: number;
  referenciaExterna: string | null;
};

export type PagoDesdeCuentaUpsert = {
  fecha: string;
  cuentaOrigenId: number;
  pagadoA: string | null;
  responsableId: number | null;
  rubroClasificacionId: number | null;
  rubroAplicadoId: number | null;
  periodoId: number | null;
  descripcion: string | null;
  monto: number;
  referenciaExterna: string | null;
};
