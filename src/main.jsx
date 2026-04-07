import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// Do NOT import tailwind here if you aren't using it
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)