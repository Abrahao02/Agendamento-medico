import AppRoutes from "./routes/AppRoutes"
import { ToastProvider } from "./components/common/Toast"
import { ServicesProvider } from "./contexts/ServicesContext"

function App() {
  return (
    <ServicesProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </ServicesProvider>
  )
}

export default App
