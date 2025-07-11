import React from "react";
import Navbar from "./components/Navbar.component";
import { Route, Routes } from "react-router-dom";
import UserAuthForm from "./pages/UserAuthForm.page";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Navbar />}>
        <Route path="signin" element={<UserAuthForm type={"signin"} />} />
        <Route path="signup" element={<UserAuthForm type={"signup"} />} />
      </Route>
    </Routes>
  );
};

export default App;
