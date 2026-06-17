
// Layout para páginas públicas (Login, 404).
// Não inclui navbar principal.

import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="gv-public-layout">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
