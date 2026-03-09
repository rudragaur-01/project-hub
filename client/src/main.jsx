import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./context/AuthContext";
import { ProjectsProvider } from "./context/ProjectsContext";
import './index.css'
import 'react-toastify/dist/ReactToastify.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProjectsProvider>
          <App />
          <ToastContainer position="top-right" autoClose={2000} />
        </ProjectsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
