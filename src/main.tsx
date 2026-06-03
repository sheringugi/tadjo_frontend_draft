import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; // Assuming you have an App.tsx component
import './index.css'; // Your global styles
import './i18n'; // This line initializes the translation library

// This will help you verify if the environment variable is being loaded correctly by Vite.
// If this prints 'undefined' or the wrong URL, check your .env file and restart the dev server.
console.log("VITE_API_BASE_URL from env:", import.meta.env.VITE_API_BASE_URL);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);