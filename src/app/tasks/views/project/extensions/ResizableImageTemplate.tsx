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
  const [showModal, setShowModal] = useState(false);

  const handleDoubleClick = () => {
    if (!isEditable) {
      setShowModal(true);
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

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

  const setDisplayMode = (mode: string) => {
    console.log('Changing display mode to:', mode);
    updateAttributes({ displayMode: mode });
  };

  const width = node.attrs.width || 'auto';
  const height = node.attrs.height || 'auto';
  const align = node.attrs.align || 'left';
  const displayMode = node.attrs.displayMode || 'float';

  let containerStyle: React.CSSProperties = {
    display: displayMode === 'inline' ? 'inline-block' : 'inline-block',
    position: 'relative',
    maxWidth: '100%',
  };

  if (displayMode === 'float') {
    if (align === 'center') {
      containerStyle = {
        ...containerStyle,
        display: 'block',
        marginLeft: 'auto',
        marginRight: 'auto',
        float: 'none',
      };
    } else if (align === 'right') {
      containerStyle = {
        ...containerStyle,
        float: 'right',
        marginLeft: '1rem',
        marginRight: '0',
      };
    } else if (align === 'left') {
      containerStyle = {
        ...containerStyle,
        float: 'left',
        marginRight: '1rem',
        marginLeft: '0',
      };
    }
  } else {
    // Режим "В тексте" - как inline элемент
    containerStyle = {
      display: 'inline-block',
      position: 'relative',
      verticalAlign: 'middle',
      margin: '0 2px',
      maxWidth: '100%',
    };
  }

  return (
    <NodeViewWrapper
      className="resizable-image-wrapper"
      style={containerStyle}
      data-drag-handle={isEditable ? "" : undefined}
    >
      <div
        className={`relative inline-block ${selected && isEditable ? 'ring-2 ring-gray-400' : ''}`}
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
            cursor: isEditable ? 'move' : 'pointer',
          }}
          draggable={isEditable}
          data-drag-handle={isEditable ? "" : undefined}
          onDoubleClick={handleDoubleClick}
        />

        {selected && isEditable && (
          <>
            {/* Маркеры изменения размера - стандартные серые */}
            <div
              className="absolute -top-1 -left-1 w-2 h-2 bg-gray-400 border border-gray-600 cursor-nw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
              draggable={false}
            />
            <div
              className="absolute -top-1 -right-1 w-2 h-2 bg-gray-400 border border-gray-600 cursor-ne-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'ne')}
              draggable={false}
            />
            <div
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-gray-400 border border-gray-600 cursor-sw-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
              draggable={false}
            />
            <div
              className="absolute -bottom-1 -right-1 w-2 h-2 bg-gray-400 border border-gray-600 cursor-se-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'se')}
              draggable={false}
            />

            {/* Маркеры на сторонах */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-400 border border-gray-600 cursor-n-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'n')}
              draggable={false}
            />
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-400 border border-gray-600 cursor-s-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 's')}
              draggable={false}
            />
            <div
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 border border-gray-600 cursor-w-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'w')}
              draggable={false}
            />
            <div
              className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 border border-gray-600 cursor-e-resize z-10"
              onMouseDown={(e) => handleMouseDown(e, 'e')}
              draggable={false}
            />

            {/* Панель режимов отображения внутри изображения */}
            <div className="absolute top-2 right-2 flex gap-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow-lg p-1 z-20" draggable={false}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDisplayMode('float');
                }}
                className={`p-1.5 rounded transition-colors ${
                  displayMode === 'float' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
                title="Квадрат (обтекание текстом)"
                draggable={false}
                type="button"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h6v6H3V3zm8 0h10v2H11V3zm0 4h10v2H11V7zm-8 6h6v6H3v-6zm8 0h10v2H11v-2zm0 4h10v2H11v-2z"/>
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDisplayMode('inline');
                }}
                className={`p-1.5 rounded transition-colors ${
                  displayMode === 'inline' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                }`}
                title="В тексте (как строка)"
                draggable={false}
                type="button"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v2H3V3zm0 4h8v2H3V7zm10 0h8v2h-8V7zm-10 4h6v2H3v-2zm8 0h10v2H11v-2zm-8 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Модальное окно для просмотра изображения */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div className="relative max-w-screen-lg max-h-screen-lg p-4">
            <button
              onClick={closeModal}
              className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 shadow-lg z-10"
              title="Закрыть"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={node.attrs.src}
              alt={node.attrs.alt || ''}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
}
