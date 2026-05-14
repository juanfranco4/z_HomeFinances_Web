import { AppBar, Box, Container, Grid, Toolbar, Typography } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { SideNav } from "../components/navigation/SideNav";
import { useAuth } from "../auth/AuthContext";

const routeTitles: Record<string, string> = {
  "/": "Inicio",
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fb" }}>
      <AppBar position="static" elevation={1}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" fontWeight={700}>Finanzas_Home Web</Typography>
          <Typography variant="body2">{user?.username ?? ""}</Typography>
        </Toolbar>
      </AppBar>

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
    </Box>
  );
}
