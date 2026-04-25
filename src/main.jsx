import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './Components/REDUX_FEATURES/STORE/store.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}> {/* Make sure to import your Redux store at the top */}
    <App />
    </Provider>
  </StrictMode>,
)
