import baseBg from '../../assets/backgrounds/login/login-page-bg.png';
import portalBg from '../../assets/backgrounds/login/geekverse_loading_screen.png';
import geekverseLogo from '../../assets/backgrounds/dashboard/geekverse_logo_cropped.png';

const LoginTransitionLoader = () => {
  return (
    <>
      <style>
        {`
          @keyframes portalEnergyPulse {
            0%, 100% {
              opacity: 0.46;
              filter: saturate(1.12) brightness(1.06) contrast(1.04);
              transform: scale(1);
            }
            50% {
              opacity: 0.55;
              filter: saturate(1.18) brightness(1.08) contrast(1.05);
              transform: scale(1.015);
            }
          }
          @keyframes loginFadeIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
      <div
        style={{
          position: 'relative',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `url(${baseBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Overlay Escuro Leve para contraste */}
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.25)',
            zIndex: 1,
          }}
        ></div>

        {/* Overlay do Portal (Camada de Energia Pulsante) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${portalBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            zIndex: 2,
            animation: 'portalEnergyPulse 1.8s ease-in-out infinite',
          }}
        ></div>
        
        {/* Conteúdo Central (Somente Logo) */}
        <div
          style={{
            position: 'relative',
            zIndex: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            animation: 'loginFadeIn 0.45s ease-out both',
          }}
        >
          <img
            src={geekverseLogo}
            alt="GeekVerse G8"
            style={{
              width: 'min(315px, 93%)',
              maxHeight: '74px',
              objectFit: 'contain',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 16px rgba(0, 212, 255, 0.45))',
            }}
          />
        </div>
      </div>
    </>
  );
};

export default LoginTransitionLoader;
