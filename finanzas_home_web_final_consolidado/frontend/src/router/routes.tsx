import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import LoginPage from "../pages/auth/LoginPage";
import HomePage from "../pages/home/HomePage";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import CatalogosPage from "../pages/catalogos/CatalogosPage";
import IngresosPage from "../pages/tesoreria/IngresosPage";
import MovimientosPage from "../pages/tesoreria/MovimientosPage";
import PagoTarjetasPage from "../pages/tesoreria/PagoTarjetasPage";
import PagosDesdeCuentaPage from "../pages/tesoreria/PagosDesdeCuentaPage";
import CargaMasivaComprasPage from "../pages/carga-masiva-compras/CargaMasivaComprasPage";
import EstadosTdcPage from "../pages/estados-tdc/EstadosTdcPage";
import BalanceGeneralPage from "../pages/balance-general/BalanceGeneralPage";
import CierrePeriodoPage from "../pages/cierre-periodo/CierrePeriodoPage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: <ProtectedRoute><MainLayout /></ProtectedRoute>,
    children: [
      { index: true, element: <HomePage /> },
      { path: "catalogos", element: <CatalogosPage /> },
      { path: "tesoreria/ingresos", element: <IngresosPage /> },
      { path: "tesoreria/movimientos", element: <MovimientosPage /> },
      { path: "tesoreria/pago-tarjetas", element: <PagoTarjetasPage /> },
      { path: "tesoreria/pagos-desde-cuenta", element: <PagosDesdeCuentaPage /> },
      { path: "carga-masiva-compras", element: <CargaMasivaComprasPage /> },
      { path: "estados-tdc", element: <EstadosTdcPage /> },
      { path: "balance-general", element: <BalanceGeneralPage /> },
      { path: "cierre-periodo", element: <CierrePeriodoPage /> },
    ],
  },
]);
