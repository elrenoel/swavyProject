import { Outlet } from "react-router-dom";
import Navbar from "./components/layouts/Navbar";
import Footer from "./components/layouts/Footer";

// Terima setCurrentTrack sebagai props dari App.js
const MainLayout = ({ setCurrentTrack }) => {
  return (
    <>
      <Navbar setCurrentTrack={setCurrentTrack} />
      <main>
        <Outlet />{" "}
        {/* Halaman seperti Home, Discover, dll akan muncul di sini */}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout;
