import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  GlobalStyles,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from "@mui/x-data-grid";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPagoDesdeCuenta,
  deletePagoDesdeCuenta,
  getCuentasPago,
  getPagosDesdeCuenta,
  getPeriodosPago,
  getResponsablesPago,
  getRubrosPago,
  updatePagoDesdeCuenta,
} from "../../services/tesoreriaApi";
import type { CatalogoSimple, PagoDesdeCuenta, PagoDesdeCuentaUpsert } from "../../types/tesoreria";

function formatMonto(value: number) {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(value || 0);
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

const LOCAL_TITLE_SIZE = "13px";
const BODY_TEXT_SIZE = "11px";

function PageStyles() {
  return (
    <GlobalStyles
      styles={{
        ":root": {
          fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
        },
      }}
    />
  );
}

function Panel({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "8px",
        border: "1px solid #e5e7eb",
        backgroundColor: "rgba(255,255,255,.96)",
        boxShadow: "0 2px 8px rgba(15,23,42,.05)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function CellText({ value }: { value: unknown }) {
  const text = value == null || value === "" ? "—" : String(value);
  return (
    <Tooltip title={text} arrow>
      <Typography
        title={text}
        sx={{
          fontSize: BODY_TEXT_SIZE,
          lineHeight: 1.2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          width: "100%",
        }}
      >
        {text}
      </Typography>
    </Tooltip>
  );
}

function FieldBlock({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={{ fontSize: "11px", color: "#6b7280", lineHeight: 1, fontWeight: 500, mb: 0.45 }}>
        {label}
      </Typography>
      {children}
    </Box>
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
      const matchesText =
        !q ||
        [
          row.fecha,
          row.cuentaOrigen,
          row.pagadoA,
          row.responsable,
          row.rubroClasificacion,
          row.rubroAplicado,
          row.periodo,
          row.descripcion,
          row.referenciaExterna,
        ]
          .filter(Boolean)
          .some((x) => String(x).toLowerCase().includes(q));
      const matchesPeriod = periodFilter === "" || row.periodoId === periodFilter;
      return matchesText && matchesPeriod;
    });
  }, [rows, search, periodFilter]);

  const stats = useMemo(() => {
    const total = filteredRows.reduce((acc, row) => acc + Number(row.monto ?? 0), 0);
    const maxPago = filteredRows.reduce((max, row) => Math.max(max, Number(row.monto ?? 0)), 0);
    const noPresup = filteredRows
      .filter((row) => String(row.rubroAplicado ?? "").toLowerCase().includes("presupuest"))
      .reduce((acc, row) => acc + Number(row.monto ?? 0), 0);
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

  const columns = useMemo<GridColDef<PagoDesdeCuenta>[]>(
    () => [
      { field: "fecha", headerName: "Fecha", minWidth: 92, flex: 0.75, renderCell: (p: GridRenderCellParams<PagoDesdeCuenta>) => <CellText value={p.value} /> },
      { field: "cuentaOrigen", headerName: "Cuenta", minWidth: 175, flex: 1.25, renderCell: (p: GridRenderCellParams<PagoDesdeCuenta>) => <CellText value={p.value} /> },
      { field: "pagadoA", headerName: "Pagado a", minWidth: 180, flex: 1.3, renderCell: (p: GridRenderCellParams<PagoDesdeCuenta>) => <CellText value={p.value} /> },
      { field: "responsable", headerName: "Responsable", minWidth: 130, flex: 1, renderCell: (p: GridRenderCellParams<PagoDesdeCuenta>) => <CellText value={p.value} /> },
      {
        field: "rubroAplicado",
        headerName: "Rubro aplicado",
        minWidth: 130,
        flex: 1,
        renderCell: (params: GridRenderCellParams<PagoDesdeCuenta>) => (
          <Chip
            size="small"
            label={params.value || "Sin rubro"}
            sx={{
              height: 18,
              borderRadius: "6px",
              fontSize: "10px",
              fontWeight: 500,
              bgcolor: String(params.value ?? "").toUpperCase().includes("NO") ? "rgba(239,68,68,.1)" : "rgba(99,102,241,.1)",
              color: String(params.value ?? "").toUpperCase().includes("NO") ? "#b91c1c" : "#4338ca",
            }}
          />
        ),
      },
      { field: "periodo", headerName: "Período", minWidth: 88, flex: 0.7, renderCell: (p: GridRenderCellParams<PagoDesdeCuenta>) => <CellText value={p.value} /> },
      { field: "descripcion", headerName: "Descripción", minWidth: 220, flex: 1.45, renderCell: (p: GridRenderCellParams<PagoDesdeCuenta>) => <CellText value={p.value} /> },
      {
        field: "monto",
        headerName: "Monto",
        minWidth: 100,
        flex: 0.85,
        type: "number",
        align: "right",
        headerAlign: "right",
        valueFormatter: (value) => formatMonto(Number(value ?? 0)),
      },
      { field: "referenciaExterna", headerName: "Referencia", minWidth: 130, flex: 0.9, renderCell: (p: GridRenderCellParams<PagoDesdeCuenta>) => <CellText value={p.value} /> },
      {
        field: "acciones",
        headerName: "Acciones",
        minWidth: 94,
        sortable: false,
        filterable: false,
        disableColumnMenu: true,
        renderCell: (params: GridRenderCellParams<PagoDesdeCuenta>) => (
          <Button
            size="small"
            variant="text"
            onClick={() => onRowClick({ row: params.row } as GridRowParams<PagoDesdeCuenta>)}
            sx={{
              minWidth: 64,
              px: 1,
              fontSize: "10px",
              textTransform: "none",
              borderRadius: "6px",
              color: "#4338ca",
              fontWeight: 500,
            }}
          >
            Editar
          </Button>
        ),
      },
    ],
    []
  );

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
    pagosQuery.error instanceof Error
      ? pagosQuery.error.message
      : cuentasQuery.error instanceof Error
      ? cuentasQuery.error.message
      : responsablesQuery.error instanceof Error
      ? responsablesQuery.error.message
      : rubrosQuery.error instanceof Error
      ? rubrosQuery.error.message
      : periodosQuery.error instanceof Error
      ? periodosQuery.error.message
      : createMutation.error instanceof Error
      ? createMutation.error.message
      : updateMutation.error instanceof Error
      ? updateMutation.error.message
      : deleteMutation.error instanceof Error
      ? deleteMutation.error.message
      : null;

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "none",
        fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
        m: 0,
        p: 0,
      }}
    >
      <PageStyles />
      <Stack spacing={1.1}>
        <Panel sx={{ px: 1.5, py: 0.75 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ minHeight: 40 }}>
            <Box>
              <Typography sx={{ fontSize: "16px", lineHeight: 1.1, fontWeight: 600, color: "#111827" }}>Pagos desde cuenta</Typography>
              <Typography sx={{ fontSize: BODY_TEXT_SIZE, lineHeight: 1.2, color: "#6b7280" }}>
                Registro y control operativo de egresos con datos reales.
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.8}>
              <Button
                variant="contained"
                onClick={resetForm}
                sx={{
                  minHeight: 28,
                  px: 1.2,
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "none",
                  borderRadius: "6px",
                  bgcolor: "#4f46e5",
                  boxShadow: "none",
                }}
              >
                Nuevo pago
              </Button>
              <Button
                variant="outlined"
                sx={{
                  minHeight: 28,
                  px: 1.2,
                  fontSize: "11px",
                  fontWeight: 500,
                  textTransform: "none",
                  borderRadius: "6px",
                  borderColor: "#c7d2fe",
                  color: "#4338ca",
                }}
              >
                Exportar
              </Button>
            </Stack>
          </Stack>
        </Panel>

        {(message || error) && (
          <Alert
            severity={
              error
                ? "error"
                : message?.includes("requer") || message?.includes("mayor") || message?.includes("Selecciona")
                ? "warning"
                : "success"
            }
            sx={{
              py: 0.2,
              borderRadius: "6px",
              "& .MuiAlert-message": { fontSize: BODY_TEXT_SIZE, py: 0.5 },
            }}
          >
            {error ?? message}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(4, minmax(0,1fr))" },
            gap: 1.6,
          }}
        >
          {[
            { title: "Total filtrado", value: formatMonto(stats.total) },
            { title: "Pago más alto", value: formatMonto(stats.maxPago) },
            { title: "No presupuestado", value: formatMonto(stats.noPresup), danger: true },
            { title: "Beneficiarios", value: String(stats.uniquePayees) },
          ].map((kpi) => (
            <Box key={kpi.title}>
              <Panel sx={{ px: 1.35, py: 1.05, minHeight: 70, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <Typography sx={{ fontSize: "11.5px", color: "#6b7280", lineHeight: 1.1 }}>{kpi.title}</Typography>
                <Typography sx={{ fontSize: "17px", color: kpi.danger ? "#b91c1c" : "#111827", fontWeight: 600, lineHeight: 1.15, mt: 0.25 }}>
                  {kpi.value}
                </Typography>
              </Panel>
            </Box>
          ))}
        </Box>

        {loading && (
          <Panel sx={{ px: 1.1, py: 0.65 }}>
            <Stack direction="row" spacing={0.8} alignItems="center">
              <CircularProgress size={14} />
              <Typography sx={{ fontSize: BODY_TEXT_SIZE, color: "#4b5563" }}>Procesando información...</Typography>
            </Stack>
          </Panel>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "minmax(330px, 350px) minmax(0, 1fr)", xl: "minmax(340px, 360px) minmax(0, 1fr)" },
            gap: 1.5,
            alignItems: "start",
          }}
        >
          <Box>
            <Panel sx={{ p: 0.95 }}>
              <Typography sx={{ fontSize: LOCAL_TITLE_SIZE, color: "#111827", fontWeight: 600 }}>{selected ? "Editar pago" : "Nuevo pago"}</Typography>
              <Typography sx={{ fontSize: BODY_TEXT_SIZE, color: "#6b7280", mb: 0.7 }}>Formulario compacto de operación.</Typography>
              <Divider sx={{ mb: 0.8, borderColor: "#e5e7eb" }} />

              <Stack spacing={0.7} className="pagos-form-compact">
                <FieldBlock label="Fecha">
                  <TextField
                    size="small"
                    type="date"
                    value={form.fecha}
                    onChange={(e) => setForm((s) => ({ ...s, fecha: e.target.value }))}
                    fullWidth
                  />
                </FieldBlock>
                <FieldBlock label="Cuenta origen">
                  <TextField
                    size="small"
                    select
                    value={form.cuentaOrigenId || ""}
                    onChange={(e) => setForm((s) => ({ ...s, cuentaOrigenId: Number(e.target.value) }))}
                    fullWidth
                  >
                    {(cuentasQuery.data ?? []).map((x: CatalogoSimple) => (
                      <MenuItem key={x.id} value={x.id} sx={{ fontSize: BODY_TEXT_SIZE }}>
                        {x.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </FieldBlock>
                <FieldBlock label="Pagado a">
                  <TextField
                    size="small"
                    value={form.pagadoA ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, pagadoA: e.target.value }))}
                    fullWidth
                  />
                </FieldBlock>

                <Grid container spacing={0.7}>
                  <Grid item xs={6}>
                    <FieldBlock label="Responsable">
                      <TextField
                        size="small"
                        select
                        value={form.responsableId || ""}
                        onChange={(e) => setForm((s) => ({ ...s, responsableId: e.target.value === "" ? 0 : Number(e.target.value) }))}
                        fullWidth
                      >
                        <MenuItem value="" sx={{ fontSize: BODY_TEXT_SIZE }}>Sin responsable</MenuItem>
                        {(responsablesQuery.data ?? []).map((x: CatalogoSimple) => (
                          <MenuItem key={x.id} value={x.id} sx={{ fontSize: BODY_TEXT_SIZE }}>
                            {x.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FieldBlock>
                  </Grid>
                  <Grid item xs={6}>
                    <FieldBlock label="Período">
                      <TextField
                        size="small"
                        select
                        value={form.periodoId || ""}
                        onChange={(e) => setForm((s) => ({ ...s, periodoId: e.target.value === "" ? 0 : Number(e.target.value) }))}
                        fullWidth
                      >
                        <MenuItem value="" sx={{ fontSize: BODY_TEXT_SIZE }}>Sin período</MenuItem>
                        {(periodosQuery.data ?? []).map((x: CatalogoSimple) => (
                          <MenuItem key={x.id} value={x.id} sx={{ fontSize: BODY_TEXT_SIZE }}>
                            {x.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FieldBlock>
                  </Grid>
                </Grid>

                <Grid container spacing={0.7}>
                  <Grid item xs={6}>
                    <FieldBlock label="Rubro clasificación">
                      <TextField
                        size="small"
                        select
                        value={form.rubroClasificacionId || ""}
                        onChange={(e) => setForm((s) => ({ ...s, rubroClasificacionId: e.target.value === "" ? 0 : Number(e.target.value) }))}
                        fullWidth
                      >
                        <MenuItem value="" sx={{ fontSize: BODY_TEXT_SIZE }}>Sin rubro</MenuItem>
                        {(rubrosQuery.data ?? []).map((x: CatalogoSimple) => (
                          <MenuItem key={x.id} value={x.id} sx={{ fontSize: BODY_TEXT_SIZE }}>
                            {x.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FieldBlock>
                  </Grid>
                  <Grid item xs={6}>
                    <FieldBlock label="Rubro aplicado">
                      <TextField
                        size="small"
                        select
                        value={form.rubroAplicadoId || ""}
                        onChange={(e) => setForm((s) => ({ ...s, rubroAplicadoId: e.target.value === "" ? 0 : Number(e.target.value) }))}
                        fullWidth
                      >
                        <MenuItem value="" sx={{ fontSize: BODY_TEXT_SIZE }}>Sin rubro</MenuItem>
                        {(rubrosQuery.data ?? []).map((x: CatalogoSimple) => (
                          <MenuItem key={x.id} value={x.id} sx={{ fontSize: BODY_TEXT_SIZE }}>
                            {x.nombre}
                          </MenuItem>
                        ))}
                      </TextField>
                    </FieldBlock>
                  </Grid>
                </Grid>

                <FieldBlock label="Descripción">
                  <TextField
                    size="small"
                    value={form.descripcion ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, descripcion: e.target.value }))}
                    fullWidth
                  />
                </FieldBlock>
                <Grid container spacing={0.7}>
                  <Grid item xs={6}>
                    <FieldBlock label="Monto">
                      <TextField
                        size="small"
                        type="number"
                        value={form.monto}
                        onChange={(e) => setForm((s) => ({ ...s, monto: Number(e.target.value) }))}
                        fullWidth
                      />
                    </FieldBlock>
                  </Grid>
                  <Grid item xs={6}>
                    <FieldBlock label="Referencia">
                      <TextField
                        size="small"
                        value={form.referenciaExterna ?? ""}
                        onChange={(e) => setForm((s) => ({ ...s, referenciaExterna: e.target.value }))}
                        fullWidth
                      />
                    </FieldBlock>
                  </Grid>
                </Grid>
                <FieldBlock label="Observación">
                  <TextField
                    size="small"
                    value={form.observacion ?? ""}
                    onChange={(e) => setForm((s) => ({ ...s, observacion: e.target.value }))}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </FieldBlock>

                <Stack direction="row" spacing={0.6} sx={{ pt: 0.2 }}>
                  <Button
                    variant="contained"
                    onClick={save}
                    disabled={loading}
                    sx={{
                      minHeight: 28,
                      px: 1.1,
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "none",
                      borderRadius: "6px",
                      bgcolor: "#4f46e5",
                      boxShadow: "none",
                    }}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={resetForm}
                    disabled={loading}
                    sx={{
                      minHeight: 28,
                      px: 1,
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "none",
                      borderRadius: "6px",
                      borderColor: "#d1d5db",
                      color: "#374151",
                    }}
                  >
                    Nuevo
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    onClick={remove}
                    disabled={loading || !selected}
                    sx={{
                      minHeight: 28,
                      px: 1,
                      fontSize: "11px",
                      fontWeight: 500,
                      textTransform: "none",
                      borderRadius: "6px",
                    }}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </Stack>
            </Panel>
          </Box>

          <Box>
            <Panel sx={{ p: 1, width: "100%", minWidth: 0, height: "100%", minHeight: 620, display: "flex", flexDirection: "column" }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.8 }}>
                <Box>
                  <Typography sx={{ fontSize: LOCAL_TITLE_SIZE, color: "#111827", fontWeight: 600 }}>Historial de pagos</Typography>
                  <Typography sx={{ fontSize: BODY_TEXT_SIZE, color: "#6b7280" }}>Selecciona una fila para editar.</Typography>
                </Box>
                <Stack direction="row" spacing={0.6}>
                  <TextField
                    size="small"
                    label="Buscar"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ width: 170 }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Período"
                    value={periodFilter}
                    onChange={(e) => setPeriodFilter(e.target.value === "" ? "" : Number(e.target.value))}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="" sx={{ fontSize: BODY_TEXT_SIZE }}>Todos</MenuItem>
                    {(periodosQuery.data ?? []).map((x: CatalogoSimple) => (
                      <MenuItem key={x.id} value={x.id} sx={{ fontSize: BODY_TEXT_SIZE }}>
                        {x.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Stack>

              <Box sx={{ flex: 1, minHeight: 540, width: "100%", minWidth: 0 }}>
                <DataGrid
                  rows={filteredRows}
                  columns={columns}
                  loading={pagosQuery.isLoading}
                  disableRowSelectionOnClick
                  onRowClick={onRowClick}
                  getRowId={(r) => r.id}
                  pageSizeOptions={[10, 20, 50]}
                  initialState={{ pagination: { paginationModel: { pageSize: 20, page: 0 } } }}
                  rowHeight={36}
                  columnHeaderHeight={36}
                  sx={{
                    width: "100%",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    "& .MuiDataGrid-columnHeaders": {
                      borderTopLeftRadius: "6px",
                      borderTopRightRadius: "6px",
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid #e5e7eb",
                    },
                    "& .MuiDataGrid-columnHeaderTitle": {
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#374151",
                      fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
                    },
                    "& .MuiDataGrid-cell": {
                      borderColor: "#f1f5f9",
                      fontSize: BODY_TEXT_SIZE,
                      color: "#111827",
                      fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
                      py: 0,
                    },
                    "& .MuiDataGrid-row:hover": {
                      backgroundColor: alpha("#4f46e5", 0.05),
                    },
                    "& .MuiDataGrid-footerContainer": {
                      minHeight: 34,
                      borderTop: "1px solid #e5e7eb",
                      "& p, & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: BODY_TEXT_SIZE },
                    },
                    "& .MuiTablePagination-select": {
                      fontSize: BODY_TEXT_SIZE,
                    },
                    "& .MuiDataGrid-virtualScroller": {
                      overflowX: "auto",
                      minWidth: 0,
                    },
                    "& .MuiDataGrid-selectedRowCount": {
                      fontSize: BODY_TEXT_SIZE,
                    },
                  }}
                />
              </Box>
            </Panel>
          </Box>
        </Box>
      </Stack>

      <GlobalStyles
        styles={{
          "#root .MuiInputBase-root:not(.MuiInputBase-multiline)": {
            height: "34px",
            borderRadius: "6px",
            fontSize: BODY_TEXT_SIZE,
            fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
          },
          "#root .MuiInputBase-multiline": {
            minHeight: "68px",
            borderRadius: "6px",
            fontSize: BODY_TEXT_SIZE,
            fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
          },
          "#root .MuiInputLabel-root": {
            fontSize: "11px",
            fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
          },
          "#root .MuiMenuItem-root": {
            minHeight: "30px",
            fontSize: BODY_TEXT_SIZE,
            fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
          },
          "#root .MuiButton-root": {
            fontSize: "11px",
            fontFamily: 'Calibri, "Calibri New", Arial, sans-serif',
          },
          "#root .pagos-form-compact .MuiOutlinedInput-input": {
            paddingTop: "6px",
            paddingBottom: "6px",
          },
          "#root .pagos-form-compact .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
          },
        }}
      />
    </Box>
  );
}
