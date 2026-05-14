import { AppBar, Box, Container, Grid, Toolbar, Typography } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { SideNav } from "../components/navigation/SideNav";
import { useAuth } from "../auth/AuthContext";

const routeTitles: Record<string, string> = {
  "/": "Balance General",
  "/catalogos": "Catálogos",
  "/tesoreria/ingresos": "Tesorería / Ingresos",
  "/tesoreria/movimientos": "Tesorería / Movimientos",
  "/tesoreria/pago-tarjetas": "Tesorería / Pago de Tarjetas",
  "/tesoreria/pagos-desde-cuenta": "Tesorería / Pagos desde cuenta",
  "/carga-masiva-compras": "Carga Masiva Compras",
  "/estados-tdc": "Estados TDC",
  "/balance-general": "Balance General",
  "/cierre-periodo": "Cierre Periodo",
};

export function MainLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const isPagosDesdeCuenta = location.pathname === "/tesoreria/pagos-desde-cuenta";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#eef3fb", backgroundImage: "radial-gradient(circle at top left, rgba(99,102,241,.13), transparent 28%), radial-gradient(circle at top right, rgba(14,165,233,.1), transparent 24%)" }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: "rgba(255,255,255,.82)", color: "#0f172a", backdropFilter: "blur(18px)", borderBottom: "1px solid rgba(226,232,240,.7)" }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={900} sx={{ letterSpacing: -.4 }}>Finanzas_Home Web</Typography>
          <Typography variant="body2" fontWeight={800}>{user?.username ?? ""}</Typography>
        </Toolbar>
      </AppBar>

      {isPagosDesdeCuenta ? (
        <Box
          sx={{
            width: "100%",
            maxWidth: "none",
            py: 2,
            px: "clamp(6px, 0.9vw, 14px)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "248px minmax(0, 1fr)" },
              gap: 1.5,
              alignItems: "stretch",
            }}
          >
            <Box sx={{ height: "100%", mt: { md: 3.5, lg: 3.5 } }}>
              <SideNav />
            </Box>
            <Box minWidth={0}>
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: "19px",
                  lineHeight: 1.05,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                }}
              >
                {routeTitles[location.pathname] ?? "Finanzas_Home Web"}
              </Typography>
                <Box sx={{ mt: 0.4 }}>
                  <Outlet />
                </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3} lg={2.5}>
              <SideNav />
            </Grid>
            <Grid item xs={12} md={9} lg={9.5}>
              <Typography variant="overline" color="text.secondary">
                {routeTitles[location.pathname] ?? "Finanzas_Home Web"}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Outlet />
              </Box>
            </Grid>
          </Grid>
        </Container>
      )}
    </Box>
  );
}
