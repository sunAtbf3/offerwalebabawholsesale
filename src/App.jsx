import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Common/Navbar';
import Footer from './Components/Common/Footer';
import Home from './Components/Website_Pages/Home';
import ProductDetail from './Components/Website_Pages/ProductDetail';
import CatProducts from './Components/HomeComponents/CatProducts/CatProducts'; // ← add this
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/"                  element={<Home />} />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/category/:slug"     element={<CatProducts />} /> {/* ← add this */}
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;