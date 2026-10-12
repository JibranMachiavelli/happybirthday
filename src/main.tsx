import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { birthday } from './config/birthday'
import './styles/global.css'

for (const [k, v] of Object.entries(birthday.colors)) document.documentElement.style.setProperty(`--${k}`, v)
document.title = birthday.title

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
