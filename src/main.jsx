import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx';
import { LayoutProvider } from './contexts/LayoutContext';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LayoutProvider>
      <App />
    </LayoutProvider>
  </React.StrictMode>
)
