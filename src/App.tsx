import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import React, { useState, useRef } from 'react';
import Login from './pages/login/Login';
import Home from './pages/home/Home';
import Menu from "./components/menu/Menu";
import Player from "./components/player/Player";
import UploadFile from './components/uploadFile/UploadFile';
import Sidebar from './components/sideBar/Sidebar';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute';

interface SongDetails {
  id: number;
  title: string;
  artist: {
    id: number;
    name: string;
  };
  length: number;
  imageUrl: string;
}

function App() {
  const [selectedSongId, setSelectedSongId] = useState<number | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSong, setCurrentSong] = useState<SongDetails | null>(null);
  const playerRef = useRef<{ togglePlayPause: () => void } | null>(null);
  const location = useLocation();

  const handleTogglePlayPause = () => {
    if (playerRef.current) {
      playerRef.current.togglePlayPause();
      setIsPlaying(!isPlaying);
    }
  };

  const shouldShowComponents = location.pathname !== '/';

  return (
    <div>
      {shouldShowComponents && <Sidebar />}
      {shouldShowComponents && <Menu />}
      {shouldShowComponents && (
        <Player
          ref={playerRef}
          songId={selectedSongId}
          setIsPlaying={setIsPlaying}
          currentSong={currentSong}
        />
      )}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={
          <Home
            setSelectedSongId={setSelectedSongId}
            setIsPlaying={setIsPlaying}
            setCurrentSong={setCurrentSong}
            handleTogglePlayPause={handleTogglePlayPause}
            isPlaying={isPlaying}
            selectedSongId={selectedSongId}
          />
        } />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <UploadFile />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
