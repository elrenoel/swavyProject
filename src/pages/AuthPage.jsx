import { Route, Routes, Navigate } from "react-router-dom"; // Import Navigate
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import NavbarAuth from "../components/layouts/NavbarAuth";

const AuthPage = () => {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <NavbarAuth />

      <main className="flex-1 overflow-y-auto bg-gray-100">
        <Routes>
          <Route path="/" element={<Navigate to="login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Routes>
      </main>
    </div>
  );
};

export default AuthPage;
