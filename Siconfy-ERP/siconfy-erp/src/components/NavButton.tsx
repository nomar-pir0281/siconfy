import React from 'react';

interface NavButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  colorClass: string;
}

export const NavButton: React.FC<NavButtonProps> = ({ onClick, isActive, children, colorClass }) => (
  <button
    onClick={onClick}
    className={`px-2 py-2 rounded transition text-xs md:text-sm font-bold ${
      isActive ? colorClass : 'hover:bg-slate-700'
    }`}
  >
    {children}
  </button>
);