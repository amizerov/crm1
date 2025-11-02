'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect, useRef, useState } from 'react';
import { uploadProjectImage } from '../actions/uploadImage';
import { CustomResizableImage } from '../extensions/CustomResizableImage';
import MediaLibrary from './MediaLibrary';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable: boolean;
  projectId: number;
  onImageUploadStart?: () => void;
  onImageUploadEnd?: () => void;
  isFullscreen?: boolean;
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  editable, 
  projectId,
  onImageUploadStart,
  onImageUploadEnd,
  isFullscreen = false
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      CustomResizableImage,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3',
      },
    },
  });

  // Обновляем содержимое при изменении content
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Обновляем режим редактирования
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  // Обработка загрузки изображения
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5 МБ');
      return;
    }

    try {
      onImageUploadStart?.();
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadProjectImage(projectId, formData);
      
      if (result.success && result.path) {
        editor.chain().focus().setImage({ src: result.path }).run();
      } else {
        alert(result.message || 'Ошибка загрузки изображения');
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      alert('Ошибка загрузки изображения');
    } finally {
      onImageUploadEnd?.();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {editable && (
        <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-t-lg border-b-0 p-2">
          <div className="flex flex-wrap gap-1">
            {/* Текстовые стили */}
            <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-500">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors cursor-pointer ${
                  editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Жирный (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors cursor-pointer ${
                  editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Курсив (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors cursor-pointer ${
                  editor.isActive('underline') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Подчеркнутый (Ctrl+U)"
              >
                <u>U</u>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors cursor-pointer ${
                  editor.isActive('strike') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Зачеркнутый"
              >
                <s>S</s>
              </button>
            </div>

            {/* Заголовки */}
            <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-500">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-sm font-bold cursor-pointer ${
                  editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Заголовок 1"
              >
                H1
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-sm font-bold cursor-pointer ${
                  editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Заголовок 2"
              >
                H2
              </button>
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-sm font-bold cursor-pointer ${
                  editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Заголовок 3"
              >
                H3
              </button>
              <button
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500 text-sm cursor-pointer ${
                  editor.isActive('paragraph') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Обычный текст"
              >
                P
              </button>
            </div>

            {/* Списки */}
            <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-500">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer ${
                  editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Маркированный список"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
                </svg>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer ${
                  editor.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Нумерованный список"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
                </svg>
              </button>
            </div>

            {/* Выравнивание */}
            <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-500">
              <button
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer ${
                  editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="По левому краю"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/>
                </svg>
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer ${
                  editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="По центру"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/>
                </svg>
              </button>
              <button
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer ${
                  editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="По правому краю"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/>
                </svg>
              </button>
            </div>

            {/* Изображения и ссылки */}
            <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-500">
              <button
                onClick={() => {
                  const url = prompt('Введите URL:');
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run();
                  }
                }}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer"
                title="Вставить ссылку"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
                </svg>
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer"
                title="Загрузить изображение"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                </svg>
              </button>
              <button
                onClick={() => setShowMediaLibrary(true)}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer"
                title="Медиатека проекта"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11.5-6.5l2.5 3.01L16.5 8.5l3.5 4.5H8l2.5-3zm-4.5 6h4v-14H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2z"/>
                </svg>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      <div 
        className={`border border-gray-200 dark:border-gray-600 ${
          editable ? 'rounded-b-lg' : 'rounded-lg'
        } overflow-auto`}
        style={{ 
          height: isFullscreen 
            ? (editable ? 'calc(100vh - 155px)' : 'calc(100vh - 100px)')
            : (editable ? 'calc(100vh - 372px)' : 'calc(100vh - 315px)'),
          minHeight: '300px' 
        }}
      >
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          padding: 1rem;
          background: white;
          min-height: 100%;
          outline: none;
        }
        
        .dark .ProseMirror {
          background: rgb(31, 41, 55);
        }
        
        .dark .ProseMirror {
          background: rgb(31, 41, 55);
        }
        
        /* Стили для изображений с возможностью изменения размера */
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 10px 0;
          display: block;
          cursor: grab;
          transition: all 0.2s ease;
        }
        
        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        
        .ProseMirror img:hover {
          opacity: 0.95;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        /* Контейнер для изменяемого изображения */
        .ProseMirror .image-resizer {
          position: relative;
          display: inline-block;
          max-width: 100%;
        }
        
        .ProseMirror .image-resizer img {
          width: 100%;
          height: auto;
        }
        
        /* Ручки для изменения размера */
        .ProseMirror .image-resizer .resize-trigger {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border: 2px solid white;
          border-radius: 50%;
          cursor: nwse-resize;
          z-index: 10;
        }
        
        .ProseMirror .image-resizer .resize-trigger.ne {
          top: -5px;
          right: -5px;
          cursor: nesw-resize;
        }
        
        .ProseMirror .image-resizer .resize-trigger.nw {
          top: -5px;
          left: -5px;
          cursor: nwse-resize;
        }
        
        .ProseMirror .image-resizer .resize-trigger.se {
          bottom: -5px;
          right: -5px;
          cursor: nwse-resize;
        }
        
        .ProseMirror .image-resizer .resize-trigger.sw {
          bottom: -5px;
          left: -5px;
          cursor: nesw-resize;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: 'Начните вводить текст или загрузите изображение...';
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        /* Темная тема */
        .dark .ProseMirror p.is-editor-empty:first-child::before {
          color: #6b7280;
        }
        
        /* Стили для списков */
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
        }
        
        /* Стили для заголовков */
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1rem 0 0.5rem;
        }
        
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75rem 0 0.5rem;
        }
        
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 0.5rem 0 0.25rem;
        }
        
        /* Стили для ссылок */
        .ProseMirror a {
          color: #3b82f6;
          text-decoration: underline;
          cursor: pointer;
        }
        
        .ProseMirror a:hover {
          color: #2563eb;
        }
      `}</style>
      
      {/* Медиатека */}
      {showMediaLibrary && (
        <MediaLibrary
          projectId={projectId}
          onImageSelect={(imagePath) => {
            if (editor) {
              editor.chain().focus().setImage({ src: imagePath }).run();
            }
          }}
          onClose={() => setShowMediaLibrary(false)}
        />
      )}
    </div>
  );
}
