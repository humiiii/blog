import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ReactLenis } from 'lenis/react'


import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
    <BrowserRouter>
          <ReactLenis root />
      <App />
    </BrowserRouter>
  // </StrictMode>
);
