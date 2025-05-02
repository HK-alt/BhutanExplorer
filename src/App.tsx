//import React from 'react';
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import MapNavigationBar from './components/NavBar';
import AboutUs from './components/About';
import { Routes, Route } from 'react-router-dom';




function App() {
  

  return (
  <div>
    <Routes>
      <Route path="/" element={<MapNavigationBar />} />
      <Route path="/about" element={<AboutUs />} />
    </Routes>
  </div>
  )
}

export default App
