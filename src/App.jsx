import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PlayerPage from './pages/PlayerPage';
import ViewAllPage from './pages/ViewAllPage';
import Ferrofluid from './components/Ferrofluid';
import { UserActivityProvider } from './context/UserActivityContext';

function App() {
  return (
    <UserActivityProvider>
      <div className="global-fluid-bg">
        <Ferrofluid
          colors={["#cb0000","#c00000","#bf0000"]}
          speed={0.2}
          scale={1}
          turbulence={1}
          fluidity={0.1}
          rimWidth={0.2}
          sharpness={3}
          shimmer={1}
          glow={2}
          flowDirection="down"
          opacity={1}
          mouseInteraction={true}
          mouseStrength={1}
          mouseRadius={0.3}
        />
      </div>
      <div className="app-content">
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/player" element={<PlayerPage />} />
            <Route path="/viewall" element={<ViewAllPage />} />
          </Routes>
        </Router>
      </div>
    </UserActivityProvider>
  );
}

export default App;
