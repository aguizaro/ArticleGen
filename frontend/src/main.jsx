import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/header.jsx";
import Footer from "./components/footer/footer.jsx";
import App from "./App.jsx";
import Gallery from "./components/gallery/gallery.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
    <BrowserRouter basename="/">
      <Header />
      <Routes>
        <Route path="/" Component={App} />
        <Route path="/gallery" Component={Gallery} />
        <Route path="*" Component={App} />
      </Routes>
      <Footer />
    </BrowserRouter>
);
