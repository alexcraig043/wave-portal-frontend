import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
// Setting to App.jsx fixed MIME error
import App from './App.jsx'

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
