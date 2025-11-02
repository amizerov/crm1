'use client';

import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

export default function ResizableImageTemplate({ node, updateAttributes, selected, editor }: any) {
  const isEditable = editor?.isEditable ?? false;
  const imgRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const img = imgRef.current;
    if (!img) return;

    setIsResizing(true);
    setResizeHandle(handle);
    setStartSize({
      width: img.offsetWidth,
      height: img.offsetHeight,
    });
    setStartPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const img = imgRef.current;
      if (!img || !resizeHandle) return;

      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;

      let newWidth = startSize.width;
      let newHeight = startSize.height;

      // Вычисляем новый размер в зависимости от угла
      if (resizeHandle.includes('e')) {
        newWidth = startSize.width + deltaX;
      }
      if (resizeHandle.includes('w')) {
        newWidth = startSize.width - deltaX;
      }
      if (resizeHandle.includes('s')) {
        newHeight = startSize.height + deltaY;
      }
      if (resizeHandle.includes('n')) {
        newHeight = startSize.height - deltaY;
      }

      // Сохраняем пропорции при изменении углов
      if (resizeHandle.length === 2) {
        const aspectRatio = startSize.width / startSize.height;
        newHeight = newWidth / aspectRatio;
      }

      // Минимальный размер
      newWidth = Math.max(50, newWidth);
      newHeight = Math.max(50, newHeight);

      updateAttributes({
        width: `${newWidth}px`,
        height: 'auto',
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeHandle, startPos, startSize, updateAttributes]);

  const setAlignment = (align: string) => {
    updateAttributes({ align });
  };

  const width = node.attrs.width || 'auto';
  const height = node.attrs.height || 'auto';
  const align = node.attrs.align || 'left';

  let containerStyle: React.CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    maxWidth: '100%',
  };

  if (align === 'center') {
    containerStyle = {
      ...containerStyle,
      display: 'block',
      marginLeft: 'auto',
      marginRight: 'auto',
    };
  } else if (align === 'right') {
    containerStyle = {
      ...containerStyle,
      float: 'right',
      marginLeft: '1rem',
    };
  } else if (align === 'left') {
    containerStyle = {
      ...containerStyle,
      float: 'left',
      marginRight: '1rem',
    };
  }

  return (
    <NodeViewWrapper
      className="resizable-image-wrapper"
      style={containerStyle}
    >
      <div
        className={`relative inline-block ${selected && isEditable ? 'ring-2 ring-blue-500' : ''}`}
        style={{ maxWidth: '100%' }}
      >
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          title={node.attrs.title || ''}
          style={{
            width,
            height,
            display: 'block',
            maxWidth: '100%',
          }}
          draggable={false}
        />

        {selected && isEditable && (
          <>
            {/* Ручка для перетаскивания */}
            <div 
              className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-500 text-white text-xs rounded cursor-move hover:bg-blue-600 flex items-center gap-1"
              data-drag-handle=""
              title="Перетащите для перемещения"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 3L5 6.99h3V14h2V6.99h3L9 3zm7 14.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/>
              </svg>
              <span>Переместить</span>
            </div>

            {/* Кнопки выравнивания */}
            <div className="absolute -top-10 left-0 flex gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg p-1 z-10" draggable={false}>
              <button
                onClick={() => setAlignment('left')}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  align === 'left' ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
                title="Влево"
                draggable={false}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setAlignment('center')}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  align === 'center' ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
                title="По центру"
                draggable={false}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v2H3V3zm4 4h10v2H7V7zm-4 4h18v2H3v-2zm4 4h10v2H7v-2zm-4 4h18v2H3v-2z"/>
                </svg>
              </button>
              <button
                onClick={() => setAlignment('right')}
                className={`p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${
                  align === 'right' ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
                title="Вправо"
                draggable={false}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z"/>
                </svg>
              </button>
            </div>

            {/* Маркеры изменения размера */}
            <div
              className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
              draggable={false}
            />
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-ne-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
              draggable={false}
            />
            <div
              className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-sw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
              draggable={false}
            />
            <div
              className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-se-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'se')}
              draggable={false}
            />

            {/* Маркеры на сторонах */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-n-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'n')}
              draggable={false}
            />
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-s-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 's')}
              draggable={false}
            />
            <div
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-w-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'w')}
              draggable={false}
            />
            <div
              className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 border-2 border-white rounded-full cursor-e-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'e')}
              draggable={false}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}
