import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, CircularProgress, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPagoDesdeCuenta, deletePagoDesdeCuenta, getCuentasPago, getPagosDesdeCuenta, getPeriodosPago, getResponsablesPago, getRubrosPago, updatePagoDesdeCuenta } from "../../services/tesoreriaApi";
import type { CatalogoSimple, PagoDesdeCuenta, PagoDesdeCuentaUpsert } from "../../types/tesoreria";

function formatMonto(value: number) {
  return new Intl.NumberFormat("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

const emptyForm: PagoDesdeCuentaUpsert = {
  fecha: "",
  cuentaOrigenId: 0,
  pagadoA: "",
  responsableId: null,
  rubroClasificacionId: null,
  rubroAplicadoId: null,
  periodoId: null,
  descripcion: "",
  monto: 0,
  referenciaExterna: "",
};

export default function PagosDesdeCuentaPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<PagoDesdeCuenta | null>(null);
  const [form, setForm] = useState<PagoDesdeCuentaUpsert>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);

  const pagosQuery = useQuery({ queryKey: ["tesoreria", "pagos-desde-cuenta"], queryFn: getPagosDesdeCuenta });
  const cuentasQuery = useQuery({ queryKey: ["tesoreria", "catalogos", "cuentas"], queryFn: getCuentasPago });
  const responsablesQuery = useQuery({ queryKey: ["tesoreria", "catalogos", "responsables"], queryFn: getResponsablesPago });
  const rubrosQuery = useQuery({ queryKey: ["tesoreria", "catalogos", "rubros"], queryFn: getRubrosPago });
  const periodosQuery = useQuery({ queryKey: ["tesoreria", "catalogos", "periodos"], queryFn: getPeriodosPago });

  useEffect(() => {
    if (selected) {
      setForm({
        fecha: selected.fecha,
        cuentaOrigenId: selected.cuentaOrigenId ?? 0,
        pagadoA: selected.pagadoA ?? "",
        responsableId: selected.responsableId ?? null,
        rubroClasificacionId: selected.rubroClasificacionId ?? null,
        rubroAplicadoId: selected.rubroAplicadoId ?? null,
        periodoId: selected.periodoId ?? null,
        descripcion: selected.descripcion ?? "",
        monto: selected.monto,
        referenciaExterna: selected.referenciaExterna ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [selected]);

  const createMutation = useMutation({
    mutationFn: createPagoDesdeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tesoreria", "pagos-desde-cuenta"] });
      setSelected(null);
      setForm(emptyForm);
      setMessage("Pago desde cuenta creado.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PagoDesdeCuentaUpsert }) => updatePagoDesdeCuenta(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tesoreria", "pagos-desde-cuenta"] });
      setSelected(null);
      setForm(emptyForm);
      setMessage("Pago desde cuenta actualizado.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePagoDesdeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tesoreria", "pagos-desde-cuenta"] });
      setSelected(null);
      setForm(emptyForm);
      setMessage("Pago desde cuenta eliminado.");
    },
  });

  const columns = useMemo<GridColDef<PagoDesdeCuenta>[]>(() => [
    { field: "fecha", headerName: "Fecha", flex: 1 },
    { field: "cuentaOrigen", headerName: "Cuenta origen", flex: 1.4 },
    { field: "pagadoA", headerName: "Pagado a", flex: 1.4 },
    { field: "responsable", headerName: "Responsable", flex: 1 },
    { field: "rubroClasificacion", headerName: "Rubro clasificación", flex: 1.2 },
    { field: "rubroAplicado", headerName: "Rubro aplicado", flex: 1.2 },
    { field: "periodo", headerName: "Período", flex: 1 },
    { field: "descripcion", headerName: "Descripción", flex: 1.8 },
    {
      field: "monto",
      headerName: "Monto",
      flex: 1,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => formatMonto(Number(value ?? 0)),
    },
    { field: "referenciaExterna", headerName: "Referencia externa", flex: 1.5 },
  ], []);

  function onRowClick(params: GridRowParams<PagoDesdeCuenta>) {
    setSelected(params.row);
    setMessage(null);
  }

  function resetForm() {
    setSelected(null);
    setForm(emptyForm);
    setMessage(null);
  }

  function validateForm(): string | null {
    if (!form.fecha) return "Fecha requerida.";
    if (!form.cuentaOrigenId) return "Cuenta origen requerida.";
    if (!form.monto || Number(form.monto) <= 0) return "Monto debe ser mayor a 0.";
    return null;
  }

  function save() {
    const error = validateForm();
    if (error) return setMessage(error);
    if (selected) updateMutation.mutate({ id: selected.id, payload: form });
    else createMutation.mutate(form);
  }

  function remove() {
    if (!selected) return setMessage("Selecciona un pago desde cuenta.");
    deleteMutation.mutate(selected.id);
  }

  const loading =
    pagosQuery.isLoading ||
    cuentasQuery.isLoading ||
    responsablesQuery.isLoading ||
    rubrosQuery.isLoading ||
    periodosQuery.isLoading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const error =
    pagosQuery.error instanceof Error ? pagosQuery.error.message :
    cuentasQuery.error instanceof Error ? cuentasQuery.error.message :
    responsablesQuery.error instanceof Error ? responsablesQuery.error.message :
    rubrosQuery.error instanceof Error ? rubrosQuery.error.message :
    periodosQuery.error instanceof Error ? periodosQuery.error.message :
    createMutation.error instanceof Error ? createMutation.error.message :
    updateMutation.error instanceof Error ? updateMutation.error.message :
    deleteMutation.error instanceof Error ? deleteMutation.error.message : null;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Tesorería / Pagos desde cuenta
      </Typography>

      {(message || error) && (
        <Alert severity={error ? "error" : "success"} sx={{ mb: 2 }}>
          {error ?? message}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">Procesando...</Typography>
        </Box>
      )}

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {selected ? "Editar pago desde cuenta" : "Nuevo pago desde cuenta"}
            </Typography>

            <Stack spacing={2}>
              <TextField label="Fecha" type="date" value={form.fecha} onChange={(e) => setForm((s) => ({ ...s, fecha: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
              <TextField select label="Cuenta origen" value={form.cuentaOrigenId || ""} onChange={(e) => setForm((s) => ({ ...s, cuentaOrigenId: Number(e.target.value) }))} fullWidth>
                {(cuentasQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
              </TextField>
              <TextField label="Pagado a" value={form.pagadoA ?? ""} onChange={(e) => setForm((s) => ({ ...s, pagadoA: e.target.value }))} fullWidth />
              <TextField select label="Responsable" value={form.responsableId ?? ""} onChange={(e) => setForm((s) => ({ ...s, responsableId: e.target.value === "" ? null : Number(e.target.value) }))} fullWidth>
                <MenuItem value="">Sin responsable</MenuItem>
                {(responsablesQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
              </TextField>
              <TextField select label="Rubro clasificación" value={form.rubroClasificacionId ?? ""} onChange={(e) => setForm((s) => ({ ...s, rubroClasificacionId: e.target.value === "" ? null : Number(e.target.value) }))} fullWidth>
                <MenuItem value="">Sin rubro</MenuItem>
                {(rubrosQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
              </TextField>
              <TextField select label="Rubro aplicado" value={form.rubroAplicadoId ?? ""} onChange={(e) => setForm((s) => ({ ...s, rubroAplicadoId: e.target.value === "" ? null : Number(e.target.value) }))} fullWidth>
                <MenuItem value="">Sin rubro</MenuItem>
                {(rubrosQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
              </TextField>
              <TextField select label="Período" value={form.periodoId ?? ""} onChange={(e) => setForm((s) => ({ ...s, periodoId: e.target.value === "" ? null : Number(e.target.value) }))} fullWidth>
                <MenuItem value="">Sin período</MenuItem>
                {(periodosQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
              </TextField>
              <TextField label="Descripción" value={form.descripcion ?? ""} onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))} fullWidth />
              <TextField label="Monto" type="number" value={form.monto} onChange={(e) => setForm((s) => ({ ...s, monto: Number(e.target.value) }))} fullWidth />
              <TextField label="Referencia externa" value={form.referenciaExterna ?? ""} onChange={(e) => setForm((s) => ({ ...s, referenciaExterna: e.target.value }))} fullWidth />
              <Stack direction="row" spacing={1.5}>
                <Button variant="contained" onClick={save} disabled={loading}>Guardar</Button>
                <Button variant="outlined" onClick={resetForm} disabled={loading}>Nuevo</Button>
                <Button color="error" variant="outlined" onClick={remove} disabled={loading || !selected}>Eliminar</Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden", minHeight: 560 }}>
            <DataGrid
              rows={pagosQuery.data ?? []}
              columns={columns}
              loading={pagosQuery.isLoading}
              disableRowSelectionOnClick
              onRowClick={onRowClick}
              pageSizeOptions={[10, 20, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
