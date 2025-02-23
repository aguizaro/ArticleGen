import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./style.css";
import { HashRouter, Routes, Route } from "react-router-dom";
import Header from "./components/header/header.jsx";
import Home from "./components/home/home.jsx";
import Footer from "./components/footer/footer.jsx";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  //<React.StrictMode>
  <HashRouter>
    <Header />
    <Routes>
      <Route path="/" Component={App} />
    </Routes>
    <Footer />
  </HashRouter>
  //</React.StrictMode>
);
