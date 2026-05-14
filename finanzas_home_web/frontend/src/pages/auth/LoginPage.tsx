import { useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    const ok = await login(username, password);
    if (!ok) return setError("Usuario y clave requeridos.");
    navigate("/", { replace: true });
  }

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "#f5f7fb", p: 2 }}>
      <Paper elevation={2} sx={{ p: 4, borderRadius: 3, width: "100%", maxWidth: 420 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>Finanzas_Home</Typography>
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        <Stack spacing={2}>
          <TextField label="Usuario" value={username} onChange={(e) => setUsername(e.target.value)} fullWidth />
          <TextField label="Clave" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          <Button variant="contained" onClick={submit}>Ingresar</Button>
        </Stack>
      </Paper>
    </Box>
  );
}
