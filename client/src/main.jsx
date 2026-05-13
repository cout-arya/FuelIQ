import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import axios from 'axios'

let apiBase = import.meta.env.VITE_API_URL || '';
// Automatically clean up common environment variable mistakes (trailing slashes or including /api)
apiBase = apiBase.replace(/\/+$/, ''); // Remove trailing slashes
if (apiBase.endsWith('/api')) {
    apiBase = apiBase.slice(0, -4);
}
axios.defaults.baseURL = apiBase ? `${apiBase}/api` : '/api';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
