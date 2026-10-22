import React, { useRef, useState, useEffect } from 'react';

interface TouchControlsProps {
  onVectorChange: (vec: { x: number; y: number } | null) => void;
  onActionClick: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onVectorChange,
  onActionClick,
}) => {
  const joystickRef = useRef<HTMLDivElement | null>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const radius = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateVector(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!isDragging) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateVector(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsDragging(false);
        setKnobPos({ x: 0, y: 0 });
        onVectorChange(null);
        break;
      }
    }
  };

  const updateVector = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= radius) {
      setKnobPos({ x: dx, y: dy });
      onVectorChange({ x: dx / radius, y: dy / radius });
    } else {
      const angle = Math.atan2(dy, dx);
      const nx = Math.cos(angle) * radius;
      const ny = Math.sin(angle) * radius;
      setKnobPos({ x: nx, y: ny });
      onVectorChange({ x: Math.cos(angle), y: Math.sin(angle) });
    }
  };

  // Keyboard hint for desktop, but touch controls available on all screens
  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none">
      {/* Virtual D-pad (Bottom-left area, above chat bar on mobile) */}
      <div className="absolute bottom-20 left-4 pointer-events-auto sm:hidden">
        <div
          ref={joystickRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="relative w-28 h-28 rounded-full bg-slate-900/60 border-2 border-slate-700 flex items-center justify-center backdrop-blur-xs shadow-lg active:scale-95 transition-transform"
        >
          {/* Inner Knob */}
          <div
            className="w-12 h-12 rounded-full bg-sky-500/80 border-2 border-sky-300 shadow-md transform pointer-events-none"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          />
        </div>
      </div>

      {/* Floating Action Button for Mobile (Bottom-right above toolbar) */}
      <div className="absolute bottom-20 right-4 pointer-events-auto sm:hidden">
        <button
          onClick={onActionClick}
          className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-90 text-slate-950 font-pixel text-xs font-bold border-2 border-amber-300 shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-transform"
        >
          <span>AKSI</span>
          <span className="text-[8px] font-mono opacity-80">SPASI</span>
        </button>
      </div>
    </div>
  );
};
