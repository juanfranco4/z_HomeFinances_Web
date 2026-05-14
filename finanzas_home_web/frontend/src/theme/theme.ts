import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1e3a8a" },
    background: { default: "#f5f7fb", paper: "#fff" },
  },
  shape: { borderRadius: 12 },
});
