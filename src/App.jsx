// App.jsx
// Componente raiz do GeekVerse G8.
// Configura BrowserRouter, AuthProvider e todas as rotas.
// Rotas públicas: /login
// Rotas privadas: /app/*
// Rota 404: *

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import ProtectedLayout from './components/layout/ProtectedLayout';
import PublicLayout from './components/layout/PublicLayout';

// Pages
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import HarryMemory from './pages/games/harryPotter/HarryMemory';
import PokemonBattle from './pages/games/pokemon/PokemonBattle';
import RickMortyHunt from './pages/games/rickMorty/RickMortyHunt';
import StarWarsChallenge from './pages/games/starWars/StarWarsChallenge';
import IceFireWar from './pages/games/iceFire/IceFireWar';
import MultiverseHunt from './pages/games/multiverseHunt/MultiverseHunt';
import Ranking from './pages/ranking/Ranking';
import Exportar from './pages/exportar/Exportar';
import Sobre from './pages/sobre/Sobre';
import NotFound from './pages/NotFound';

import './App.css';
import FullscreenButton from './components/FullscreenButton/FullscreenButton';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <FullscreenButton />
        <Routes>
          {/* Rotas Públicas */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Rotas Privadas */}
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <ProtectedLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="harry-potter" element={<HarryMemory />} />
            <Route path="pokemon" element={<PokemonBattle />} />
            <Route path="rick-morty" element={<RickMortyHunt />} />
            <Route path="star-wars" element={<StarWarsChallenge />} />
            <Route path="ice-fire" element={<IceFireWar />} />
            <Route path="multiverse-hunt" element={<MultiverseHunt />} />
            <Route path="ranking" element={<Ranking />} />
            <Route path="exportar" element={<Exportar />} />
            <Route path="sobre" element={<Sobre />} />
          </Route>

          {/* Redirect raiz para login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rota 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
