import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap/dist/css/bootstrap-theme.css'

import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render } from 'react-snapshot'

import './style/App.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
)

registerServiceWorker()
