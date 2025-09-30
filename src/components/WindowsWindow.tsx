'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

interface WindowsWindowProps {
  title: string;
  children: ReactNode;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  defaultSize?: { width: number; height: number };
  minSize?: { width: number; height: number };
  icon?: string;
}

export default function WindowsWindow({ 
  title, 
  children, 
  isExpanded, 
  onToggleExpanded,
  defaultSize = { width: 800, height: 600 },
  minSize = { width: 400, height: 300 },
  icon = '📝'
}: WindowsWindowProps) {
  // Состояния для окна
  const [windowPosition, setWindowPosition] = useState({ x: 0, y: 0 });
  const [windowSize, setWindowSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, initialX: 0, initialY: 0 });
  
  const windowRef = useRef<HTMLDivElement>(null);

  // Обработка событий мыши и клавиатуры
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        onToggleExpanded();
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const newX = event.clientX - dragStart.x;
        const newY = event.clientY - dragStart.y;
        setWindowPosition({ x: newX, y: newY });
      }
      
      if (isResizing) {
        const deltaX = event.clientX - resizeStart.x;
        const deltaY = event.clientY - resizeStart.y;
        
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;
        let newX = resizeStart.initialX;
        let newY = resizeStart.initialY;
        
        if (resizeDirection.includes('right')) {
          newWidth = Math.max(minSize.width, resizeStart.width + deltaX);
        }
        if (resizeDirection.includes('left')) {
          newWidth = Math.max(minSize.width, resizeStart.width - deltaX);
          // Новая позиция X = изначальная позиция + (изначальная ширина - новая ширина)
          newX = resizeStart.initialX + (resizeStart.width - newWidth);
        }
        if (resizeDirection.includes('bottom')) {
          newHeight = Math.max(minSize.height, resizeStart.height + deltaY);
        }
        if (resizeDirection.includes('top')) {
          newHeight = Math.max(minSize.height, resizeStart.height - deltaY);
          // Новая позиция Y = изначальная позиция + (изначальная высота - новая высота)
          newY = resizeStart.initialY + (resizeStart.height - newHeight);
        }
        
        setWindowSize({ width: newWidth, height: newHeight });
        if (resizeDirection.includes('left') || resizeDirection.includes('top')) {
          setWindowPosition({ x: newX, y: newY });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection('');
    };

    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'hidden';
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.userSelect = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.overflow = 'unset';
      document.body.style.userSelect = 'unset';
    };
  }, [isExpanded, isDragging, isResizing, dragStart, resizeStart, resizeDirection, windowPosition, onToggleExpanded, minSize]);

  // Инициализация позиции окна при открытии
  useEffect(() => {
    if (isExpanded && windowPosition.x === 0 && windowPosition.y === 0) {
      const centerX = (window.innerWidth - windowSize.width) / 2;
      const centerY = (window.innerHeight - windowSize.height) / 2;
      setWindowPosition({ x: centerX, y: centerY });
    }
  }, [isExpanded, windowPosition, windowSize]);

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: event.clientX - windowPosition.x,
      y: event.clientY - windowPosition.y
    });
  };

  const handleResizeMouseDown = (event: React.MouseEvent, direction: string) => {
    event.preventDefault();
    event.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: event.clientX,
      y: event.clientY,
      width: windowSize.width,
      height: windowSize.height,
      initialX: windowPosition.x,
      initialY: windowPosition.y
    });
  };

  const getResizeCursor = (direction: string) => {
    switch (direction) {
      case 'top': return 'n-resize';
      case 'bottom': return 's-resize';
      case 'left': return 'w-resize';
      case 'right': return 'e-resize';
      case 'top-left': return 'nw-resize';
      case 'top-right': return 'ne-resize';
      case 'bottom-left': return 'sw-resize';
      case 'bottom-right': return 'se-resize';
      default: return 'default';
    }
  };

  return (
    <div 
      ref={windowRef}
      style={{ 
        border: '1px solid #e9ecef', 
        borderRadius: 8, 
        padding: 0,
        backgroundColor: '#f8f9fa',
        // Режим окна
        position: isExpanded ? 'fixed' : 'relative',
        top: isExpanded ? windowPosition.y : 'auto',
        left: isExpanded ? windowPosition.x : 'auto',
        width: isExpanded ? windowSize.width : 'auto',
        height: isExpanded ? windowSize.height : 'auto',
        zIndex: isExpanded ? 9999 : 'auto',
        overflow: 'hidden',
        boxShadow: isExpanded ? '0 10px 50px rgba(0,0,0,0.3)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* Resize handles для всех сторон */}
      {isExpanded && (
        <>
          {/* Угловые resize handles */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-left')}
            style={{
              position: 'absolute',
              top: 0, left: 0,
              width: 10, height: 10,
              cursor: getResizeCursor('top-left'),
              zIndex: 10
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'top-right')}
            style={{
              position: 'absolute',
              top: 0, right: 0,
              width: 10, height: 10,
              cursor: getResizeCursor('top-right'),
              zIndex: 10
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-left')}
            style={{
              position: 'absolute',
              bottom: 0, left: 0,
              width: 10, height: 10,
              cursor: getResizeCursor('bottom-left'),
              zIndex: 10
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom-right')}
            style={{
              position: 'absolute',
              bottom: 0, right: 0,
              width: 10, height: 10,
              cursor: getResizeCursor('bottom-right'),
              zIndex: 10
            }}
          />
          
          {/* Боковые resize handles */}
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'top')}
            style={{
              position: 'absolute',
              top: 0, left: 10, right: 10,
              height: 4,
              cursor: getResizeCursor('top'),
              zIndex: 9
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'bottom')}
            style={{
              position: 'absolute',
              bottom: 0, left: 10, right: 10,
              height: 4,
              cursor: getResizeCursor('bottom'),
              zIndex: 9
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'left')}
            style={{
              position: 'absolute',
              left: 0, top: 10, bottom: 10,
              width: 4,
              cursor: getResizeCursor('left'),
              zIndex: 9
            }}
          />
          <div
            onMouseDown={(e) => handleResizeMouseDown(e, 'right')}
            style={{
              position: 'absolute',
              right: 0, top: 10, bottom: 10,
              width: 4,
              cursor: getResizeCursor('right'),
              zIndex: 9
            }}
          />
        </>
      )}

      {/* Заголовок окна с возможностью перетаскивания */}
      <div 
        onMouseDown={isExpanded ? handleMouseDown : undefined}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
          paddingBottom: isExpanded ? 8 : 16,
          borderBottom: isExpanded ? '1px solid #dee2e6' : 'none',
          cursor: isExpanded ? (isDragging ? 'grabbing' : 'grab') : 'default',
          backgroundColor: isExpanded ? '#ffffff' : 'transparent',
          borderRadius: isExpanded ? '8px 8px 0 0' : '0',
          userSelect: 'none'
        }}
      >
        <h3 style={{ 
          margin: 0, 
          fontSize: 18, 
          fontWeight: 600,
          color: '#495057'
        }}>
          {icon} {title}
        </h3>
        
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={onToggleExpanded}
            style={{
              width: 30,
              height: 24,
              backgroundColor: isExpanded ? '#ffc107' : '#6c757d',
              color: isExpanded ? '#000' : 'white',
              border: '1px solid #999',
              borderRadius: 3,
              cursor: 'pointer',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
            title={isExpanded ? 'Свернуть' : 'Развернуть'}
          >
            {isExpanded ? '🗗' : '🗖'}
          </button>
        </div>
      </div>

      {/* Контент окна */}
      <div style={{ 
        padding: isExpanded ? '0 16px 16px 16px' : '0 16px 16px 16px',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {children}
      </div>
    </div>
  );
}
