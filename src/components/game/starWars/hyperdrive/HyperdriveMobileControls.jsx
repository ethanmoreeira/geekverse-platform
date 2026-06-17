import { FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const HyperdriveMobileControls = ({ handleMobileDown, handleMobileUp }) => {
  return (
    <div className="sw-mobile-controls">
      <div className="sw-mobile-dpad">
        <button
          className="sw-mobile-btn sw-mobile-btn-up"
          onPointerDown={() => handleMobileDown(0, -1)}
          onPointerUp={handleMobileUp}
          onPointerLeave={handleMobileUp}
          type="button"
          aria-label="Mover cima"
        >
          <FaChevronUp />
        </button>
        <button
          className="sw-mobile-btn sw-mobile-btn-left"
          onPointerDown={() => handleMobileDown(-1, 0)}
          onPointerUp={handleMobileUp}
          onPointerLeave={handleMobileUp}
          type="button"
          aria-label="Mover esquerda"
        >
          <FaChevronLeft />
        </button>
        <button
          className="sw-mobile-btn sw-mobile-btn-down"
          onPointerDown={() => handleMobileDown(0, 1)}
          onPointerUp={handleMobileUp}
          onPointerLeave={handleMobileUp}
          type="button"
          aria-label="Mover baixo"
        >
          <FaChevronDown />
        </button>
        <button
          className="sw-mobile-btn sw-mobile-btn-right"
          onPointerDown={() => handleMobileDown(1, 0)}
          onPointerUp={handleMobileUp}
          onPointerLeave={handleMobileUp}
          type="button"
          aria-label="Mover direita"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default HyperdriveMobileControls;
