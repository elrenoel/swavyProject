import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/layouts/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Footer from './components/layouts/Footer';
import List from './pages/List';
import Discover from './pages/Discover';
import Community from './pages/Community';
import AlbumDetail from './pages/AlbumDetail';
import EmbedPlayer from "./components/player/EmbedPlayer";
import { ListProvider } from "./context/ListContext";// ⚠️ perbaiki juga ini
import ListDetail from './pages/ListDetail';
import { ReviewProvider } from "./context/ReviewContext";

function App() {
  const [currentTrack, setCurrentTrack] = useState(null);

  return (
    <BrowserRouter>
      
      {/* 🔥 WRAP DI SINI */}
      <ListProvider>
        <ReviewProvider>
          <Navbar setCurrentTrack={setCurrentTrack} />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/album/:id" element={<AlbumDetail />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/list" element={<List />} />
            <Route
              path="/list/:id"
              element={<ListDetail setCurrentTrack={setCurrentTrack} />}
            />
            <Route path="/community" element={<Community />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>

          <Footer />

          <EmbedPlayer
            trackId={currentTrack}
            onClose={() => setCurrentTrack(null)}
          />
        </ReviewProvider>
      </ListProvider>

    </BrowserRouter>
  );
}

export default App;