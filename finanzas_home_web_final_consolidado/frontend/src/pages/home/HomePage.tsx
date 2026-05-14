import { Grid, Paper, Typography } from "@mui/material";

const cards = [
  "Catálogos",
  "Tesorería / Ingresos",
  "Tesorería / Movimientos",
  "Tesorería / Pago de Tarjetas",
  "Tesorería / Pagos desde cuenta",
  "Carga Masiva Compras",
  "Estados TDC",
  "Balance General",
  "Cierre Periodo",
];

export default function HomePage() {
  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} md={6} lg={4} key={card}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>{card}</Typography>
            <Typography variant="body2" color="text.secondary">Módulo integrado o listo para integración.</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
