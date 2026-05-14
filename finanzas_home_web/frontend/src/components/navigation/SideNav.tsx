import { Box, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

const groups = [
  {
    title: "Base",
    items: [
      { to: "/", label: "Balance General" },
      { to: "/catalogos", label: "Catálogos" },
    ],
  },
  {
    title: "Tesorería",
    items: [
      { to: "/tesoreria/ingresos", label: "Ingresos" },
      { to: "/tesoreria/movimientos", label: "Movimientos" },
      { to: "/tesoreria/pago-tarjetas", label: "Pago de Tarjetas" },
      { to: "/tesoreria/pagos-desde-cuenta", label: "Pagos desde cuenta" },
    ],
  },
  {
    title: "Operación",
    items: [
      { to: "/carga-masiva-compras", label: "Carga Masiva Compras" },
      { to: "/estados-tdc", label: "Estados TDC" },
      { to: "/cierre-periodo", label: "Cierre Periodo" },
    ],
  },
];

export function SideNav() {
  return (
    <Paper elevation={0} sx={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e5e7eb", background: "linear-gradient(180deg, rgba(255,255,255,.94), rgba(245,248,255,.74))", boxShadow: "0 8px 24px rgba(41,72,152,.08)", backdropFilter: "blur(12px)" }}>
      <Typography variant="h6" fontWeight={700} sx={{ p: 2, pb: 1 }}>
        Módulos
      </Typography>

      {groups.map((group) => (
        <Box key={group.title} sx={{ pb: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 1, display: "block" }}>
            {group.title}
          </Typography>

          <List sx={{ pt: 0 }}>
            {group.items.map((item) => (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.to === "/"}
                sx={{ borderRadius: "6px", mx: 1, mb: .4, "&.active": { bgcolor: "rgba(99,102,241,.12)", color: "#4f46e5", fontWeight: 900 }, "&:hover": { bgcolor: "rgba(99,102,241,.08)" } }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
    </Paper>
  );
}
