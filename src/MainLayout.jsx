import { Outlet } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Footer from "./components/layouts/Footer";

// Terima setCurrentTrack sebagai props dari App.js
const MainLayout = ({ setCurrentTrack }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar setCurrentTrack={setCurrentTrack} />
      <main className="flex-1 flex flex-col">
        <Outlet />{" "}
        {/* Halaman seperti Home, Discover, dll akan muncul di sini */}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
