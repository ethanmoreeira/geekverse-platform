// Arquivo Principal de Navegação (Roteador)
// É aqui que definimos os "caminhos" do site (ex: /login, /app/pokemon).
// Ele também protege o jogo, impedindo que pessoas sem login entrem.

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/layout/PrivateRoute';
import ProtectedLayout from './components/layout/ProtectedLayout';
import PublicLayout from './components/layout/PublicLayout';

// Todas as Páginas do Site
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import HarryMemory from './pages/games/harryPotter/HarryMemory';
import PokeSombra from './pages/games/pokemon/PokeSombra';
import ShowDoMultiverso from './pages/games/rickMorty/ShowDoMultiverso';
import StarWarsGame from './pages/games/starWars/StarWarsGame';
import Ranking from './pages/ranking/Ranking';
import RankingGameDetails from './pages/ranking/RankingGameDetails';
import Sobre from './pages/sobre/Sobre';
import NotFound from './pages/notFound/NotFound';

// Estilos Globais e Botões Flutuantes
import './App.css';
import FullscreenButton from './components/FullscreenButton/FullscreenButton';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/geekverse-platform">
        <FullscreenButton />
        <Routes>
          {/* Rota Aberta (Qualquer um pode ver) */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Rotas Fechadas (Só entra com a senha/login) */}
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
            <Route path="pokemon" element={<PokeSombra />} />
            <Route path="rick-morty" element={<ShowDoMultiverso />} />
            <Route path="star-wars" element={<StarWarsGame />} />
            <Route path="ranking">
              <Route index element={<Ranking />} />
              <Route path=":gameId" element={<RankingGameDetails />} />
            </Route>
            <Route path="sobre" element={<Sobre />} />
          </Route>

          {/* Se a pessoa tentar acessar a raiz vazia, joga ela pro Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Se a pessoa digitar um endereço que não existe, mostra a página de Erro 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
