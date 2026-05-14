import { Paper, Typography } from "@mui/material";
export default function Page() {
  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Estados TDC</Typography>
      <Typography variant="body1">Módulo base / placeholder dentro del consolidado final.</Typography>
    </Paper>
  );
}
