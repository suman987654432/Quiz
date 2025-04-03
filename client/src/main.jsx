import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <NavigationContext.Provider  >
      <App />
    </NavigationContext.Provider>
  </StrictMode>,
)
