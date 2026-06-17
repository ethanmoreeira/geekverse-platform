
// Layout para páginas protegidas (autenticadas).
// Inclui AppNavbar no topo e Outlet para renderizar sub-rotas.

import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

const ProtectedLayout = () => {
  return (
    <div className="gv-protected-layout">
      <AppNavbar />
      <main className="gv-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
