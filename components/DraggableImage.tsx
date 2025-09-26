"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface DraggableImageProps {
  src: string;
  alt: string;
  initialX?: number;
  initialY?: number;
  width?: number;
  height?: number;
  className?: string;
  fixed?: boolean; // New prop to control if position is fixed
}

const DraggableImage: React.FC<DraggableImageProps> = ({
  src,
  alt,
  initialX = 0,
  initialY = 0,
  width = 96,
  height = 96,
  className = "",
  fixed = false
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const elementRef = useRef<HTMLDivElement>(null);

  // Handle mouse drag start
  const handleMouseDown = (e: React.MouseEvent) => {
    if (fixed || e.button !== 0) return; // Don't drag if fixed or not left click
    e.preventDefault();
    
    const rect = elementRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle touch drag start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (fixed) return; // Don't drag if fixed
    e.preventDefault();
    const touch = e.touches[0];
    
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };


  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  // Handle touch move
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        const touch = e.touches[0];
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y
        });
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart]);


  return (
    <div
      ref={elementRef}
      className={`absolute select-none ${fixed ? 'cursor-default' : 'cursor-move'} ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        zIndex: 9999 // Very high z-index to appear on top
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className="relative group">
        {/* Main image container */}
        <div 
          className="rounded-full overflow-hidden border-2 border-white shadow-lg bg-white/10 backdrop-blur-sm"
          style={{ width: `${width}px`, height: `${height}px` }}
        >
          <Image 
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-full object-cover"
            unoptimized
            draggable={false}
          />
        </div>
        
      </div>
      
      {/* Instructions tooltip */}
      {!fixed && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            Drag to move
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableImage;
