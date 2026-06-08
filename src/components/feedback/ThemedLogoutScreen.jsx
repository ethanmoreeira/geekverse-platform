import { PropagateLoader } from 'react-spinners';
import bgImage from '../../assets/backgrounds/harry-potter/harry-logout-bg.png';
import '../../styles/games.css';

const ThemedLogoutScreen = () => {
  return (
    <div className="gv-themed-logout-wrapper">
      <div 
        className="gv-themed-logout-bg"
        style={{ backgroundImage: `url(${bgImage})` }}
      ></div>
      <div className="gv-themed-logout-overlay"></div>
      
      <div className="gv-themed-logout-content">
        <PropagateLoader color="#eab308" size={20} className="gv-themed-loader-spinner" />
        <h2 className="gv-themed-logout-title">Até a próxima, bruxo.</h2>
      </div>
    </div>
  );
};

export default ThemedLogoutScreen;
