/**
 * main.tsx - Application entry point
 * Initializes React app with PWA support via VitePWA plugin
 */
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA service worker is automatically registered by VitePWA plugin
// No manual registration needed

createRoot(document.getElementById("root")!).render(<App />);
