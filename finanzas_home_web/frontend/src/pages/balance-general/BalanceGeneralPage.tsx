import { Box, Chip, CircularProgress, Divider, GlobalStyles, Grid, LinearProgress, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBalanceGeneral, getPeriodosPago } from "../../services/tesoreriaApi";
import type { BalanceCuenta, CatalogoSimple, PresupuestoRubro, TarjetaResumen } from "../../types/tesoreria";

const money = (value: number, currency = "CLP") =>
  new Intl.NumberFormat("es-CL", { style: "currency", currency, maximumFractionDigits: currency === "CLP" ? 0 : 2 }).format(value || 0);

function DashboardStyles() {
  return <GlobalStyles styles={{
    "@keyframes floatCard": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-9px)" } },
    "@keyframes pulseGlow": { "0%,100%": { opacity: .35, transform: "scale(1)" }, "50%": { opacity: .72, transform: "scale(1.09)" } },
    "@keyframes drawLine": { from: { strokeDashoffset: 900 }, to: { strokeDashoffset: 0 } },
    "@keyframes fadeUp": { from: { opacity: 0, transform: "translateY(18px)" }, to: { opacity: 1, transform: "translateY(0)" } },
  }} />;
}

function GlassCard({ children, sx = {} }: { children: React.ReactNode; sx?: object }) {
  return <Paper elevation={0} sx={{ position: "relative", overflow: "hidden", borderRadius: 6, p: 3, border: "1px solid rgba(255,255,255,.72)", background: "linear-gradient(145deg, rgba(255,255,255,.94), rgba(245,248,255,.76))", boxShadow: "0 24px 80px rgba(41,72,152,.14)", backdropFilter: "blur(22px)", animation: "fadeUp .55s ease both", ...sx }}>{children}</Paper>;
}

function KpiCard({ label, value, helper, tone, index }: { label: string; value: string; helper: string; tone: string; index: number }) {
  return <GlassCard sx={{ minHeight: 166, animationDelay: `${index * 70}ms` }}>
    <Box sx={{ position: "absolute", right: -32, top: -36, width: 132, height: 132, borderRadius: "50%", bgcolor: alpha(tone, .18), filter: "blur(6px)", animation: "pulseGlow 4s ease-in-out infinite" }} />
    <Typography variant="body2" color="text.secondary" fontWeight={800}>{label}</Typography>
    <Typography variant="h4" fontWeight={950} sx={{ mt: 1, letterSpacing: -1 }}>{value}</Typography>
    <Typography variant="caption" color="text.secondary">{helper}</Typography>
    <Box sx={{ mt: 2.5, height: 8, borderRadius: 999, bgcolor: "rgba(15,23,42,.07)", overflow: "hidden" }}>
      <Box sx={{ height: "100%", width: `${78 - index * 8}%`, borderRadius: 999, background: `linear-gradient(90deg, ${tone}, ${alpha(tone, .35)})` }} />
    </Box>
  </GlassCard>;
}

function FlowChart({ rubros }: { rubros: PresupuestoRubro[] }) {
  const data = rubros.slice(0, 8).map((r) => ({ label: (r.rubroNombre ?? "Rubro").slice(0, 10), value: r.montoConsumido || 0, budget: r.montoPresupuestado || 0 }));
  const fallback = ["Comida", "Colegio", "Créditos", "No pres."].map((label) => ({ label, value: 0, budget: 0 }));
  const rows = data.length ? data : fallback;
  const max = Math.max(1, ...rows.map((x) => Math.max(x.value, x.budget)));
  const points = rows.map((x, i) => `${42 + i * 70},${235 - (x.value / max) * 172}`).join(" ");
  return <GlassCard sx={{ minHeight: 360 }}>
    <Typography variant="h6" fontWeight={950}>Pulso presupuestario real</Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Consume información calculada desde SQL Server por período y rubro.</Typography>
    <svg viewBox="0 0 610 260" width="100%" height="260" role="img">
      {[55, 105, 155, 205].map((y) => <line key={y} x1="30" x2="590" y1={y} y2={y} stroke="rgba(15,23,42,.07)" strokeDasharray="7 10" />)}
      {rows.map((x, i) => {
        const px = 42 + i * 70;
        const b = (x.budget / max) * 158;
        const v = (x.value / max) * 158;
        return <g key={x.label}>
          <rect x={px - 16} y={235 - b} width="12" height={b} rx="6" fill="rgba(99,102,241,.18)" />
          <rect x={px - 1} y={235 - v} width="12" height={v} rx="6" fill="rgba(249,115,22,.58)" />
          <text x={px - 22} y="255" fontSize="10" fill="rgba(71,85,105,.8)">{x.label}</text>
        </g>;
      })}
      <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="900" style={{ animation: "drawLine 1.5s ease both" }} />
    </svg>
  </GlassCard>;
}

function RiskOrb({ percent }: { percent: number }) {
  const value = Math.min(100, Math.max(0, Math.round(percent || 0)));
  return <GlassCard sx={{ minHeight: 360, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
    <Box><Typography variant="h6" fontWeight={950}>Nivel de presión mensual</Typography><Typography variant="body2" color="text.secondary">Presupuesto consumido en el período seleccionado.</Typography></Box>
    <Box sx={{ display: "grid", placeItems: "center", py: 2 }}>
      <Box sx={{ position: "relative", width: 210, height: 210, animation: "floatCard 5s ease-in-out infinite" }}>
        <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 35% 25%, rgba(255,255,255,.96), rgba(99,102,241,.18) 36%, rgba(249,115,22,.28) 68%, rgba(239,68,68,.18))", boxShadow: "0 30px 80px rgba(99,102,241,.24)" }} />
        <Box sx={{ position: "absolute", inset: 18, borderRadius: "50%", border: "16px solid rgba(15,23,42,.07)", borderTopColor: value > 85 ? "#ef4444" : value > 65 ? "#f97316" : "#10b981", transform: `rotate(${value * 2.2}deg)` }} />
        <Stack sx={{ position: "absolute", inset: 0 }} alignItems="center" justifyContent="center">
          <Typography variant="h3" fontWeight={950}>{value}%</Typography>
          <Typography variant="caption" fontWeight={900} color="text.secondary">PRESIÓN</Typography>
        </Stack>
      </Box>
    </Box>
    <LinearProgress variant="determinate" value={value} sx={{ height: 10, borderRadius: 999 }} />
  </GlassCard>;
}

function CuentaRow({ c }: { c: BalanceCuenta }) {
  const tone = c.saldoCalculado >= 0 ? "#10b981" : "#ef4444";
  return <Box sx={{ p: 2, borderRadius: 4, bgcolor: "rgba(248,250,252,.74)", border: "1px solid rgba(226,232,240,.8)" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box><Typography fontWeight={900}>{c.nombreCuenta}</Typography><Typography variant="caption" color="text.secondary">{c.entidadFinanciera} · {c.tipoCuentaNombre} · {c.monedaCodigo}</Typography></Box>
      <Typography fontWeight={950} color={tone}>{money(c.saldoCalculado, c.monedaCodigo)}</Typography>
    </Stack>
  </Box>;
}

function TarjetaRow({ t }: { t: TarjetaResumen }) {
  const used = t.cupoCredito ? Math.min(100, Math.max(0, (t.deudaTotalBruta / t.cupoCredito) * 100)) : 0;
  return <Box sx={{ p: 2, borderRadius: 4, bgcolor: "rgba(248,250,252,.74)", border: "1px solid rgba(226,232,240,.8)" }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box><Typography fontWeight={900}>{t.nombreTarjeta}</Typography><Typography variant="caption" color="text.secondary">Corte {t.fechaCorteDia ?? "-"} · Pago {t.fechaPagoDia ?? "-"} · próximo {t.proximoPeriodoPendienteCodigo ?? "sin deuda"}</Typography></Box>
      <Typography fontWeight={950} color="#f97316">{money(t.netoTotalPendiente)}</Typography>
    </Stack>
    {t.cupoCredito ? <LinearProgress variant="determinate" value={used} sx={{ mt: 1.3, height: 8, borderRadius: 999 }} /> : null}
  </Box>;
}

export default function BalanceGeneralPage() {
  const periodosQuery = useQuery({ queryKey: ["periodos"], queryFn: getPeriodosPago });
  const [periodoId, setPeriodoId] = useState<number | "">("");
  const balanceQuery = useQuery({ queryKey: ["balance-general", periodoId], queryFn: () => getBalanceGeneral(periodoId), refetchInterval: 60000 });
  const data = balanceQuery.data;

  const kpis = useMemo(() => {
    const totalCLP = data?.monedas.find((m) => m.monedaCodigo === "CLP")?.saldoTotalMoneda ?? data?.monedas[0]?.saldoTotalMoneda ?? 0;
    const deudaTdc = data?.tarjetas.reduce((a, t) => a + (t.netoTotalPendiente || 0), 0) ?? 0;
    const consumido = data?.presupuestoResumen?.montoConsumidoTotal ?? data?.presupuestoRubros.reduce((a, r) => a + (r.montoConsumido || 0), 0) ?? 0;
    const libre = data?.presupuestoResumen?.saldoDisponibleTotal ?? 0;
    return [
      { label: "Balance disponible", value: money(totalCLP), helper: "Saldo por moneda desde vw_BalancePorMoneda", tone: "#10b981" },
      { label: "Deuda TDC", value: money(deudaTdc), helper: "Tarjetas desde vw_TarjetaResumenGeneral", tone: "#f97316" },
      { label: "Consumido período", value: money(consumido), helper: "Presupuesto real calculado por SQL", tone: "#ef4444" },
      { label: "Disponible presupuesto", value: money(libre), helper: "Saldo presupuestario del período", tone: "#6366f1" },
    ];
  }, [data]);

  return <Box sx={{ position: "relative", minHeight: "100%", p: { xs: 2, md: 4 }, background: "radial-gradient(circle at 8% 8%, rgba(99,102,241,.18), transparent 28%), radial-gradient(circle at 84% 5%, rgba(16,185,129,.14), transparent 24%), linear-gradient(180deg, #f8fafc 0%, #eef4ff 100%)" }}>
    <DashboardStyles />
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ position: "relative", overflow: "hidden", borderRadius: 7, p: { xs: 3, md: 4 }, color: "#fff", background: "linear-gradient(135deg, #0f172a 0%, #312e81 48%, #0f766e 100%)", boxShadow: "0 30px 90px rgba(15,23,42,.26)" }}>
        <Box sx={{ position: "absolute", width: 360, height: 360, right: -100, top: -150, borderRadius: "50%", bgcolor: "rgba(255,255,255,.16)", filter: "blur(10px)", animation: "pulseGlow 5s ease-in-out infinite" }} />
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
          <Box>
            <Chip label="BALANCE GENERAL · HOME FINANCES" sx={{ bgcolor: "rgba(255,255,255,.16)", color: "#fff", fontWeight: 900, mb: 1.5 }} />
            <Typography variant="h3" fontWeight={950} sx={{ letterSpacing: -1.5 }}>Panel principal financiero</Typography>
            <Typography sx={{ mt: 1, color: "rgba(255,255,255,.78)", maxWidth: 780 }}>Página principal conectada a la BBDD real: saldos, tarjetas, presupuesto y presión mensual sin cálculos inventados en React.</Typography>
          </Box>
          <TextField select size="small" label="Período" value={periodoId} onChange={(e) => setPeriodoId(e.target.value === "" ? "" : Number(e.target.value))} sx={{ minWidth: 170, bgcolor: "rgba(255,255,255,.94)", borderRadius: 3 }}>
            <MenuItem value="">Sin período</MenuItem>
            {(periodosQuery.data ?? []).map((p: CatalogoSimple) => <MenuItem key={p.id} value={p.id}>{p.nombre}</MenuItem>)}
          </TextField>
        </Stack>
      </Paper>

      {balanceQuery.isLoading && <GlassCard sx={{ py: 1.5 }}><Stack direction="row" gap={1.5} alignItems="center"><CircularProgress size={20} /><Typography fontWeight={800}>Leyendo vistas y procedimientos de Finanzas_Home...</Typography></Stack></GlassCard>}

      <Grid container spacing={2.5}>{kpis.map((k, i) => <Grid key={k.label} item xs={12} sm={6} lg={3}><KpiCard {...k} index={i} /></Grid>)}</Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}><FlowChart rubros={data?.presupuestoRubros ?? []} /></Grid>
        <Grid item xs={12} lg={4}><RiskOrb percent={data?.presupuestoResumen?.porcentajeConsumido ?? 0} /></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={4}><GlassCard sx={{ minHeight: 430 }}><Typography variant="h6" fontWeight={950}>Cuentas activas</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Desde fin.vw_BalanceCuenta</Typography><Stack spacing={1.2}>{(data?.cuentas ?? []).slice(0, 7).map((c) => <CuentaRow key={c.cuentaFinancieraId} c={c} />)}</Stack></GlassCard></Grid>
        <Grid item xs={12} lg={4}><GlassCard sx={{ minHeight: 430 }}><Typography variant="h6" fontWeight={950}>Tarjetas y deuda</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Desde fin.vw_TarjetaResumenGeneral</Typography><Stack spacing={1.2}>{(data?.tarjetas ?? []).slice(0, 7).map((t) => <TarjetaRow key={t.tarjetaCreditoId} t={t} />)}</Stack></GlassCard></Grid>
        <Grid item xs={12} lg={4}><GlassCard sx={{ minHeight: 430 }}><Typography variant="h6" fontWeight={950}>Presupuesto por rubro</Typography><Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>CREDITOS y NO_PRESUPUESTADO aparecen como rubros reales.</Typography><Stack spacing={1.4}>{(data?.presupuestoRubros ?? []).slice(0, 8).map((r) => { const pct = Math.min(100, Math.max(0, r.porcentajeConsumido || 0)); const hot = (r.rubroCodigo ?? "").includes("CREDIT") || (r.rubroCodigo ?? "").includes("NO_PRES"); return <Box key={`${r.rubroId}-${r.rubroNombre}`}><Stack direction="row" justifyContent="space-between"><Typography fontWeight={900}>{r.rubroNombre}</Typography><Typography fontWeight={950} color={hot ? "#f97316" : "#334155"}>{money(r.montoConsumido)}</Typography></Stack><LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 999, mt: .8 }} /></Box>; })}</Stack><Divider sx={{ my: 2 }} /><Typography variant="caption" color="text.secondary">Selecciona un período para activar el resumen presupuestario.</Typography></GlassCard></Grid>
      </Grid>
    </Stack>
  </Box>;
}
