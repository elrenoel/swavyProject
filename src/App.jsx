import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

// Layouts & Components
import MainLayout from "./MainLayout";
import EmbedPlayer from "./components/player/EmbedPlayer";

// Pages
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import List from "./pages/List";
import ListDetail from "./pages/ListDetail";
import Discover from "./pages/Discover";
import Community from "./pages/Community";
import AlbumDetail from "./pages/AlbumDetail";
import AuthPage from "./pages/AuthPage";
import RequireAuth from "./components/auth/RequireAuth";

// Context
import { ListProvider } from "./context/ListContext";
import { ReviewProvider } from "./context/ReviewContext";
import { AuthProvider } from "./context/AuthContext";

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);

  return (
    <BrowserRouter>
      <AuthProvider>
        <ListProvider>
          <ReviewProvider>
            <Routes>
              {/* Bungkus Route yang butuh Navbar & Footer dengan MainLayout */}
              <Route element={<MainLayout setCurrentTrack={setCurrentTrack} />}>
                <Route path="/" element={<Home />} />
              </Route>
              <Route
                element={
                  <RequireAuth>
                    <MainLayout setCurrentTrack={setCurrentTrack} />
                  </RequireAuth>
                }
              >
                <Route path="/discover" element={<Discover />} />
                <Route path="/album/:id" element={<AlbumDetail />} />
                <Route path="/list" element={<List />} />
                <Route
                  path="/list/:id"
                  element={<ListDetail setCurrentTrack={setCurrentTrack} />}
                />
                <Route path="/community" element={<Community />} />
                <Route path="/profile" element={<Profile />} />
              </Route>

              {/* AuthPage tidak dibungkus MainLayout, jadi Navbar/Footer tidak muncul di sini */}
              <Route path="/auth/*" element={<AuthPage />} />
            </Routes>

            {/* Player Global - Tetap di sini agar tidak hilang saat pindah halaman */}
            {currentTrack && (
              <EmbedPlayer
                trackId={currentTrack}
                onClose={() => setCurrentTrack(null)}
              />
            )}
          </ReviewProvider>
        </ListProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
