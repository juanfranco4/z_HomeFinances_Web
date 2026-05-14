import { Box, List, ListItemButton, ListItemText, Paper, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";

const groups = [
  {
    title: "Base",
    items: [
      { to: "/", label: "Inicio" },
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
      { to: "/balance-general", label: "Balance General" },
      { to: "/cierre-periodo", label: "Cierre Periodo" },
    ],
  },
];

export function SideNav() {
  return (
    <Paper elevation={2} sx={{ borderRadius: 3, overflow: "hidden" }}>
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
                sx={{ "&.active": { bgcolor: "action.selected", fontWeight: 700 } }}
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
