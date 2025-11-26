import React from 'react';

interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({ onMouseDown }) => (
  <div 
    className="w-1.5 hover:bg-blue-400 bg-gray-100 cursor-col-resize transition-colors flex flex-col justify-center z-10 hover:shadow-md active:bg-blue-600 flex-shrink-0"
    onMouseDown={onMouseDown}
  />
);
