import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, CircularProgress, Divider, GlobalStyles, Grid, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPagoDesdeCuenta, deletePagoDesdeCuenta, getCuentasPago, getPagosDesdeCuenta, getPeriodosPago, getResponsablesPago, getRubrosPago, updatePagoDesdeCuenta } from "../../services/tesoreriaApi";
import type { CatalogoSimple, PagoDesdeCuenta, PagoDesdeCuentaUpsert } from "../../types/tesoreria";

function formatMonto(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value);
}

const emptyForm: PagoDesdeCuentaUpsert = {
  fecha: "",
  cuentaOrigenId: 0,
  pagadoA: "",
  responsableId: 0,
  rubroClasificacionId: 0,
  rubroAplicadoId: 0,
  periodoId: 0,
  descripcion: "",
  monto: 0,
  referenciaExterna: "",
  observacion: "",
};

function PageStyles() {
  return (
    <GlobalStyles
      styles={{
        "@keyframes fadeUp": {
          from: { opacity: 0, transform: "translateY(18px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@keyframes pulseGlow": {
          "0%, 100%": { opacity: .35, transform: "scale(1)" },
          "50%": { opacity: .75, transform: "scale(1.08)" },
        },
      }}
    />
  );
}

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 6,
        p: 2.6,
        border: "1px solid rgba(255,255,255,.78)",
        background: "linear-gradient(145deg, rgba(255,255,255,.92), rgba(244,247,255,.78))",
        boxShadow: "0 24px 80px rgba(41, 72, 152, .13)",
        backdropFilter: "blur(20px)",
        animation: "fadeUp .5s ease both",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

export default function PagosDesdeCuentaPage() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<PagoDesdeCuenta | null>(null);
  const [form, setForm] = useState<PagoDesdeCuentaUpsert>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState<number | "">("");

  const pagosQuery = useQuery({ queryKey: ["tesoreria", "pagos-desde-cuenta"], queryFn: () => getPagosDesdeCuenta() });
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
        responsableId: selected.responsableId ?? 0,
        rubroClasificacionId: selected.rubroClasificacionId ?? 0,
        rubroAplicadoId: selected.rubroAplicadoId ?? 0,
        periodoId: selected.periodoId ?? 0,
        descripcion: selected.descripcion ?? "",
        monto: selected.monto,
        referenciaExterna: selected.referenciaExterna ?? "",
        observacion: selected.observacion ?? "",
      });
    } else {
      setForm(emptyForm);
    }
  }, [selected]);

  const rows: PagoDesdeCuenta[] = pagosQuery.data ?? [];
  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesText = !q || [row.fecha, row.cuentaOrigen, row.pagadoA, row.responsable, row.rubroClasificacion, row.rubroAplicado, row.periodo, row.descripcion, row.referenciaExterna]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(q));
      const matchesPeriod = periodFilter === "" || row.periodoId === periodFilter;
      return matchesText && matchesPeriod;
    });
  }, [rows, search, periodFilter]);

  const stats = useMemo(() => {
    const total = filteredRows.reduce((acc, row) => acc + Number(row.monto ?? 0), 0);
    const maxPago = filteredRows.reduce((max, row) => Math.max(max, Number(row.monto ?? 0)), 0);
    const noPresup = filteredRows.filter((row) => String(row.rubroAplicado ?? "").toLowerCase().includes("presupuest")).reduce((acc, row) => acc + Number(row.monto ?? 0), 0);
    const uniquePayees = new Set(filteredRows.map((row) => row.pagadoA).filter(Boolean)).size;
    return { total, maxPago, noPresup, uniquePayees };
  }, [filteredRows]);

  const createMutation = useMutation({
    mutationFn: createPagoDesdeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tesoreria", "pagos-desde-cuenta"] });
      setSelected(null);
      setForm(emptyForm);
      setMessage("Pago desde cuenta creado correctamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: PagoDesdeCuentaUpsert }) => updatePagoDesdeCuenta(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tesoreria", "pagos-desde-cuenta"] });
      setSelected(null);
      setForm(emptyForm);
      setMessage("Pago desde cuenta actualizado correctamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePagoDesdeCuenta,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["tesoreria", "pagos-desde-cuenta"] });
      setSelected(null);
      setForm(emptyForm);
      setMessage("Pago desde cuenta eliminado correctamente.");
    },
  });

  const columns = useMemo<GridColDef<PagoDesdeCuenta>[]>(() => [
    { field: "fecha", headerName: "Fecha", flex: .9 },
    { field: "cuentaOrigen", headerName: "Cuenta origen", flex: 1.25 },
    { field: "pagadoA", headerName: "Pagado a", flex: 1.2, renderCell: (params) => <Typography fontWeight={850} sx={{ pt: 1.4 }}>{params.value || "—"}</Typography> },
    { field: "responsable", headerName: "Responsable", flex: 1 },
    { field: "rubroAplicado", headerName: "Rubro aplicado", flex: 1.15, renderCell: (params) => <Chip size="small" label={params.value || "Sin rubro"} sx={{ mt: 1.15, fontWeight: 900, bgcolor: String(params.value ?? "").toUpperCase().includes("NO") ? "rgba(239,68,68,.12)" : "rgba(99,102,241,.11)", color: String(params.value ?? "").toUpperCase().includes("NO") ? "#dc2626" : "#4f46e5" }} /> },
    { field: "periodo", headerName: "Período", flex: .85 },
    { field: "descripcion", headerName: "Descripción", flex: 1.5 },
    {
      field: "monto",
      headerName: "Monto",
      flex: .95,
      type: "number",
      align: "right",
      headerAlign: "right",
      valueFormatter: (value) => formatMonto(Number(value ?? 0)),
    },
    { field: "referenciaExterna", headerName: "Referencia", flex: 1 },
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
    if (!form.pagadoA?.trim()) return "Indica a quién se pagó.";
    if (!form.responsableId) return "Responsable requerido.";
    if (!form.periodoId) return "Período requerido.";
    if (!form.rubroClasificacionId) return "Rubro de clasificación requerido.";
    if (!form.rubroAplicadoId) return "Rubro aplicado requerido.";
    if (!form.descripcion?.trim()) return "Descripción requerida.";
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

  const loading = pagosQuery.isLoading || cuentasQuery.isLoading || responsablesQuery.isLoading || rubrosQuery.isLoading || periodosQuery.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

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
    <Box sx={{ position: "relative" }}>
      <PageStyles />
      <Box sx={{ position: "absolute", inset: -24, zIndex: 0, background: "radial-gradient(circle at 15% 12%, rgba(99,102,241,.18), transparent 30%), radial-gradient(circle at 90% 5%, rgba(14,165,233,.14), transparent 30%), radial-gradient(circle at 80% 82%, rgba(239,68,68,.1), transparent 28%)", pointerEvents: "none" }} />
      <Stack spacing={2.5} sx={{ position: "relative", zIndex: 1 }}>
        <Paper elevation={0} sx={{ borderRadius: 7, p: { xs: 3, md: 3.5 }, overflow: "hidden", position: "relative", color: "#fff", background: "linear-gradient(135deg, #111827 0%, #1d4ed8 52%, #7c3aed 100%)", boxShadow: "0 30px 90px rgba(37,99,235,.26)" }}>
          <Box sx={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", right: -70, top: -105, background: "radial-gradient(circle, rgba(255,255,255,.31), transparent 64%)", animation: "pulseGlow 4.5s ease-in-out infinite" }} />
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
            <Box>
              <Chip label="TESORERÍA · PAGOS DESDE CUENTA" sx={{ bgcolor: "rgba(255,255,255,.16)", color: "#fff", fontWeight: 900, mb: 1.5 }} />
              <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>Control directo de salidas de caja</Typography>
              <Typography sx={{ mt: 1, color: "rgba(255,255,255,.78)", maxWidth: 760 }}>
                Registra pagos manuales desde cuentas, clasifica el rubro aplicado y controla rápidamente qué egresos golpean el balance del período.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.2}>
              <Button variant="contained" onClick={resetForm} sx={{ bgcolor: "#fff", color: "#1d4ed8", borderRadius: 999, px: 3, fontWeight: 900, "&:hover": { bgcolor: "rgba(255,255,255,.9)" } }}>Nuevo pago</Button>
              <Button variant="outlined" sx={{ color: "#fff", borderColor: "rgba(255,255,255,.45)", borderRadius: 999, px: 3, fontWeight: 900 }}>Exportar</Button>
            </Stack>
          </Stack>
        </Paper>

        {(message || error) && <Alert severity={error ? "error" : message?.includes("requer") || message?.includes("mayor") || message?.includes("Selecciona") ? "warning" : "success"}>{error ?? message}</Alert>}

        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} lg={3}><GlassCard><Typography variant="body2" color="text.secondary" fontWeight={800}>Total filtrado</Typography><Typography variant="h4" fontWeight={950}>{formatMonto(stats.total)}</Typography><Typography variant="caption" color="text.secondary">Suma de pagos visibles</Typography></GlassCard></Grid>
          <Grid item xs={12} sm={6} lg={3}><GlassCard><Typography variant="body2" color="text.secondary" fontWeight={800}>Pago más alto</Typography><Typography variant="h4" fontWeight={950}>{formatMonto(stats.maxPago)}</Typography><Typography variant="caption" color="text.secondary">Mayor salida individual</Typography></GlassCard></Grid>
          <Grid item xs={12} sm={6} lg={3}><GlassCard><Typography variant="body2" color="text.secondary" fontWeight={800}>No presupuestado</Typography><Typography variant="h4" fontWeight={950} color="#dc2626">{formatMonto(stats.noPresup)}</Typography><Typography variant="caption" color="text.secondary">Pagos marcados fuera de presupuesto</Typography></GlassCard></Grid>
          <Grid item xs={12} sm={6} lg={3}><GlassCard><Typography variant="body2" color="text.secondary" fontWeight={800}>Beneficiarios</Typography><Typography variant="h4" fontWeight={950}>{stats.uniquePayees}</Typography><Typography variant="caption" color="text.secondary">Pagado a distintos destinatarios</Typography></GlassCard></Grid>
        </Grid>

        {loading && (
          <GlassCard sx={{ py: 1.4 }}>
            <Stack direction="row" spacing={1.5} alignItems="center"><CircularProgress size={20} /><Typography variant="body2" fontWeight={800}>Procesando información...</Typography></Stack>
          </GlassCard>
        )}

        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={4}>
            <GlassCard sx={{ p: 3, minHeight: 710 }}>
              <Typography variant="h5" fontWeight={950} sx={{ letterSpacing: -.5 }}>{selected ? "Editar pago" : "Nuevo pago"}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Formulario operativo conectado al CRUD real.</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.7}>
                <TextField label="Fecha" type="date" value={form.fecha} onChange={(e) => setForm((s) => ({ ...s, fecha: e.target.value }))} InputLabelProps={{ shrink: true }} fullWidth />
                <TextField select label="Cuenta origen" value={form.cuentaOrigenId || ""} onChange={(e) => setForm((s) => ({ ...s, cuentaOrigenId: Number(e.target.value) }))} fullWidth>
                  {(cuentasQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
                </TextField>
                <TextField label="Pagado a" value={form.pagadoA ?? ""} onChange={(e) => setForm((s) => ({ ...s, pagadoA: e.target.value }))} fullWidth />
                <Grid container spacing={1.4}>
                  <Grid item xs={12} md={6}>
                    <TextField select label="Responsable" value={form.responsableId || ""} onChange={(e) => setForm((s) => ({ ...s, responsableId: e.target.value === "" ? 0 : Number(e.target.value) }))} fullWidth>
                      <MenuItem value="">Sin responsable</MenuItem>
                      {(responsablesQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField select label="Período" value={form.periodoId || ""} onChange={(e) => setForm((s) => ({ ...s, periodoId: e.target.value === "" ? 0 : Number(e.target.value) }))} fullWidth>
                      <MenuItem value="">Sin período</MenuItem>
                      {(periodosQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
                    </TextField>
                  </Grid>
                </Grid>
                <TextField select label="Rubro clasificación" value={form.rubroClasificacionId || ""} onChange={(e) => setForm((s) => ({ ...s, rubroClasificacionId: e.target.value === "" ? 0 : Number(e.target.value) }))} fullWidth>
                  <MenuItem value="">Sin rubro</MenuItem>
                  {(rubrosQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
                </TextField>
                <TextField select label="Rubro aplicado" value={form.rubroAplicadoId || ""} onChange={(e) => setForm((s) => ({ ...s, rubroAplicadoId: e.target.value === "" ? 0 : Number(e.target.value) }))} fullWidth>
                  <MenuItem value="">Sin rubro</MenuItem>
                  {(rubrosQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
                </TextField>
                <TextField label="Descripción" value={form.descripcion ?? ""} onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))} fullWidth />
                <TextField label="Monto" type="number" value={form.monto} onChange={(e) => setForm((s) => ({ ...s, monto: Number(e.target.value) }))} fullWidth />
                <TextField label="Referencia externa" value={form.referenciaExterna ?? ""} onChange={(e) => setForm((s) => ({ ...s, referenciaExterna: e.target.value }))} fullWidth />
                <TextField label="Observación" value={form.observacion ?? ""} onChange={(e) => setForm((s) => ({ ...s, observacion: e.target.value }))} fullWidth multiline minRows={2} />
                <Stack direction="row" spacing={1.2} sx={{ pt: 1 }}>
                  <Button variant="contained" onClick={save} disabled={loading} sx={{ borderRadius: 999, px: 3, fontWeight: 900 }}>Guardar</Button>
                  <Button variant="outlined" onClick={resetForm} disabled={loading} sx={{ borderRadius: 999, fontWeight: 900 }}>Nuevo</Button>
                  <Button color="error" variant="outlined" onClick={remove} disabled={loading || !selected} sx={{ borderRadius: 999, fontWeight: 900 }}>Eliminar</Button>
                </Stack>
              </Stack>
            </GlassCard>
          </Grid>

          <Grid item xs={12} lg={8}>
            <GlassCard sx={{ p: 0, minHeight: 710 }}>
              <Box sx={{ p: 2.4 }}>
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5} alignItems={{ xs: "stretch", md: "center" }}>
                  <Box>
                    <Typography variant="h5" fontWeight={950}>Historial de pagos</Typography>
                    <Typography variant="body2" color="text.secondary">Selecciona una fila para editar. Filtra por texto o período.</Typography>
                  </Box>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <TextField size="small" label="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} />
                    <TextField select size="small" label="Período" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value === "" ? "" : Number(e.target.value))} sx={{ minWidth: 150 }}>
                      <MenuItem value="">Todos</MenuItem>
                      {(periodosQuery.data ?? []).map((x: CatalogoSimple) => <MenuItem key={x.id} value={x.id}>{x.nombre}</MenuItem>)}
                    </TextField>
                  </Stack>
                </Stack>
              </Box>
              <Box sx={{ height: 595, px: 1.5, pb: 1.5 }}>
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  loading={pagosQuery.isLoading}
                  disableRowSelectionOnClick
                  onRowClick={onRowClick}
                  pageSizeOptions={[10, 20, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                  sx={{
                    border: 0,
                    "& .MuiDataGrid-columnHeaders": { bgcolor: "rgba(248,250,252,.95)", borderRadius: 3, color: "#64748b", fontWeight: 900 },
                    "& .MuiDataGrid-row": { borderRadius: 3, transition: "all .18s ease" },
                    "& .MuiDataGrid-row:hover": { bgcolor: "rgba(99,102,241,.07)", transform: "scale(1.002)" },
                    "& .MuiDataGrid-cell": { borderColor: "rgba(226,232,240,.72)" },
                    "& .MuiDataGrid-footerContainer": { borderTop: "1px solid rgba(226,232,240,.9)" },
                  }}
                />
              </Box>
            </GlassCard>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}
