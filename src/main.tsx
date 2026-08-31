import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Surface errors that would otherwise fail silently (e.g. a rejected promise
// from a button's onClick handler) — critical on mobile where there's no
// devtools console visible to notice something went wrong.
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error ?? event.message)
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
