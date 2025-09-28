import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import RedirectPage from "./pages/auth/redirect";
import "./index.css";

ReactDOM.createRoot(document.getElementById("redirect-root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <RedirectPage />
    </BrowserRouter>
  </React.StrictMode>
);
