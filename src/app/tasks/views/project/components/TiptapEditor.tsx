'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { createLowlight } from 'lowlight';
import sql from 'highlight.js/lib/languages/sql';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import bash from 'highlight.js/lib/languages/bash';
import { useEffect, useRef, useState } from 'react';
import { uploadProjectImage } from '../actions/uploadImage';
import { uploadTaskImage } from '../../../actions/uploadTaskImage';
import { CustomResizableImage } from '../extensions/CustomResizableImage';
import MediaLibrary from './MediaLibrary';
import TaskMediaLibrary from '../../components/TaskMediaLibrary';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  editable: boolean;
  projectId: number;
  taskId?: number;
  onImageUploadStart?: () => void;
  onImageUploadEnd?: () => void;
  isFullscreen?: boolean;
  showToolbar?: boolean;
  customHeight?: string;
}

export default function TiptapEditor({ 
  content, 
  onChange, 
  editable, 
  projectId,
  taskId,
  onImageUploadStart,
  onImageUploadEnd,
  isFullscreen = false,
  showToolbar = true,
  customHeight
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  
  // Создаем lowlight и регистрируем языки
  const lowlight = createLowlight();
  lowlight.register('sql', sql);
  lowlight.register('javascript', javascript);
  lowlight.register('typescript', typescript);
  lowlight.register('python', python);
  lowlight.register('json', json);
  lowlight.register('xml', xml);
  lowlight.register('html', xml);
  lowlight.register('css', css);
  lowlight.register('bash', bash);
  lowlight.register('shell', bash);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // отключаем стандартный CodeBlock
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'plaintext',
      }),
      Underline,
      TextStyle,
      Color,
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
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3 ${editable ? 'editor-editable' : 'editor-readonly'}`,
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

  // Функция для распознавания и применения Markdown стилей
  const applyMarkdownFormatting = () => {
    if (!editor) return;

    // Получаем текст из редактора
    const text = editor.getText();
    const lines = text.split('\n');
    const result: any[] = [];
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      
      // Пустая строка - просто пропускаем, не добавляем в результат
      if (!line.trim()) {
        i++;
        continue;
      }
      
      // Блок кода
      if (line.trim().startsWith('```')) {
        const langMatch = line.trim().match(/^```(\w+)?/);
        const language = langMatch?.[1] || 'plaintext';
        const codeLines: string[] = [];
        i++;
        
        // Собираем строки кода до закрывающих ``` (включая пустые строки внутри блока)
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        
        // Применяем блок кода в редакторе, убираем пустые строки в начале и конце
        const codeContent = codeLines.join('\n').replace(/^\n+/, '').replace(/\n+$/, '');
        result.push({
          type: 'codeBlock',
          attrs: { language },
          content: codeContent
        });
        
        i++; // Пропускаем закрывающие ```
        continue;
      }
      
      // Заголовок 3
      if (line.startsWith('### ')) {
        result.push({
          type: 'heading',
          level: 3,
          content: line.substring(4).trim()
        });
        i++;
        continue;
      }
      
      // Заголовок 2
      if (line.startsWith('## ')) {
        result.push({
          type: 'heading',
          level: 2,
          content: line.substring(3).trim()
        });
        i++;
        continue;
      }
      
      // Заголовок 1
      if (line.startsWith('# ')) {
        result.push({
          type: 'heading',
          level: 1,
          content: line.substring(2).trim()
        });
        i++;
        continue;
      }
      
      // Маркированный список
      if (line.match(/^[*-]\s+/)) {
        const items: string[] = [];
        while (i < lines.length && lines[i].trim() && lines[i].match(/^[*-]\s+/)) {
          items.push(lines[i].replace(/^[*-]\s+/, '').trim());
          i++;
        }
        result.push({
          type: 'bulletList',
          items
        });
        continue;
      }
      
      // Нумерованный список
      if (line.match(/^\d+\.\s+/)) {
        const items: string[] = [];
        while (i < lines.length && lines[i].trim() && lines[i].match(/^\d+\.\s+/)) {
          items.push(lines[i].replace(/^\d+\.\s+/, '').trim());
          i++;
        }
        result.push({
          type: 'orderedList',
          items
        });
        continue;
      }
      
      // Обычный параграф - просто добавляем как есть без замен
      result.push({
        type: 'paragraph',
        content: line.trim()
      });
      
      i++;
    }
    
    // Преобразуем markdown форматирование в HTML
    const parseInlineMarkdown = (text: string): string => {
      let content = text;
      content = content.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      content = content.replace(/\*(?!\*)(.+?)\*/g, '<em>$1</em>');
      content = content.replace(/~~(.+?)~~/g, '<s>$1</s>');
      content = content.replace(/`([^`]+)`/g, '<code>$1</code>');
      content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      return content;
    };
    
    // Формируем HTML строку - все элементы слитно, без разделителей
    const htmlContent = result.map(item => {
      if (item.type === 'heading') {
        return `<h${item.level}>${item.content}</h${item.level}>`;
      } else if (item.type === 'codeBlock') {
        // Экранируем HTML в коде
        const escapedCode = item.content
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        return `<pre><code class="language-${item.attrs.language}">${escapedCode}</code></pre>`;
      } else if (item.type === 'bulletList') {
        const items = item.items.map((t: string) => `<li><p>${t}</p></li>`).join('');
        return `<ul>${items}</ul>`;
      } else if (item.type === 'orderedList') {
        const items = item.items.map((t: string) => `<li><p>${t}</p></li>`).join('');
        return `<ol>${items}</ol>`;
      } else {
        return `<p>${parseInlineMarkdown(item.content)}</p>`;
      }
    }).join(''); // Важно: без разделителей!
    
    // Устанавливаем контент одной строкой
    editor.commands.setContent(htmlContent);
    
    onChange(editor.getHTML());
  };

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

      // Используем разные функции загрузки в зависимости от того, для задачи ли это или для проекта
      const result = taskId 
        ? await uploadTaskImage(projectId, taskId, formData)
        : await uploadProjectImage(projectId, formData);
      
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
      {editable && showToolbar && (
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
              <div className="relative inline-block">
                <input
                  type="color"
                  onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                  value={editor.getAttributes('textStyle').color || '#000000'}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-500"
                  title="Цвет текста"
                />
              </div>
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

            {/* Код */}
            <div className="flex gap-1 pr-2 border-r border-gray-300 dark:border-gray-500">
              <button
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 cursor-pointer ${
                  editor.isActive('codeBlock') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Блок кода"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                </svg>
              </button>
              <button
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-500 font-mono text-sm cursor-pointer ${
                  editor.isActive('code') ? 'bg-gray-300 dark:bg-gray-500' : ''
                }`}
                title="Инлайн код"
              >
                {'<>'}
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

            {/* Markdown */}
            <div className="flex gap-1">
              <button
                onClick={applyMarkdownFormatting}
                className="px-3 py-2 rounded bg-blue-500 hover:bg-blue-600 text-white font-medium cursor-pointer transition-colors"
                title="Применить Markdown форматирование"
              >
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.2 10.4l-1.6-1.6L12 17.4l-8.6-8.6-1.6 1.6L12 20.6z"/>
                  </svg>
                  MD
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className={`border border-gray-200 dark:border-gray-600 ${
          editable ? 'rounded-b-lg bg-amber-50 dark:bg-[rgb(40,48,65)]' : 'rounded-lg bg-white dark:bg-gray-800'
        } overflow-auto`}
        style={{ 
          height: customHeight || (isFullscreen 
            ? (editable && showToolbar ? 'calc(100vh - 157px)' : 'calc(100vh - 100px)')
            : (editable && showToolbar ? 'calc(100vh - 382px)' : 'calc(100vh - 325px)')),
          minHeight: '300px' 
        }}
      >
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          padding: 1rem;
          min-height: 100%;
          outline: none;
        }
        
        /* Режим просмотра */
        .ProseMirror.editor-readonly {
          background: transparent;
        }
        
        /* Режим редактирования */
        .ProseMirror.editor-editable {
          background: transparent;
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
        
        /* Стили для блоков кода */
        .ProseMirror pre {
          background: #f1f5f9;
          color: #1e293b;
          font-family: 'JetBrainsMono', 'Courier New', Courier, monospace;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
          border: 1px solid #e2e8f0;
        }
        
        .ProseMirror pre code {
          background: transparent;
          color: inherit;
          font-size: 0.875rem;
          padding: 0;
          line-height: 1.5;
        }
        
        .ProseMirror code {
          background: transparent;
          color: #e11d48;
          padding: 0;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.875rem;
        }
        
        .dark .ProseMirror code {
          background: transparent;
          color: #fb7185;
        }
        
        .dark .ProseMirror pre {
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
        }
        
        /* Подсветка синтаксиса - светлая тема */
        .ProseMirror .hljs-keyword,
        .ProseMirror .hljs-selector-tag,
        .ProseMirror .hljs-literal,
        .ProseMirror .hljs-section,
        .ProseMirror .hljs-link {
          color: #9333ea;
          font-weight: 600;
        }
        
        .ProseMirror .hljs-string,
        .ProseMirror .hljs-attr,
        .ProseMirror .hljs-attribute {
          color: #16a34a;
        }
        
        .ProseMirror .hljs-number,
        .ProseMirror .hljs-built_in {
          color: #ea580c;
        }
        
        .ProseMirror .hljs-title,
        .ProseMirror .hljs-function,
        .ProseMirror .hljs-title.function_ {
          color: #2563eb;
        }
        
        .ProseMirror .hljs-comment,
        .ProseMirror .hljs-quote {
          color: #64748b;
          font-style: italic;
        }
        
        .ProseMirror .hljs-variable,
        .ProseMirror .hljs-params,
        .ProseMirror .hljs-template-variable {
          color: #dc2626;
        }
        
        .ProseMirror .hljs-operator,
        .ProseMirror .hljs-punctuation {
          color: #0891b2;
        }
        
        .ProseMirror .hljs-meta,
        .ProseMirror .hljs-regexp {
          color: #ca8a04;
        }
        
        .ProseMirror .hljs-tag,
        .ProseMirror .hljs-name {
          color: #dc2626;
        }
        
        .ProseMirror .hljs-class,
        .ProseMirror .hljs-type,
        .ProseMirror .hljs-title.class_ {
          color: #ca8a04;
        }
        
        /* Подсветка синтаксиса - темная тема */
        .dark .ProseMirror .hljs-keyword,
        .dark .ProseMirror .hljs-selector-tag,
        .dark .ProseMirror .hljs-literal,
        .dark .ProseMirror .hljs-section,
        .dark .ProseMirror .hljs-link {
          color: #d8b4fe;
          font-weight: 600;
        }
        
        .dark .ProseMirror .hljs-string,
        .dark .ProseMirror .hljs-attr,
        .dark .ProseMirror .hljs-attribute {
          color: #86efac;
        }
        
        .dark .ProseMirror .hljs-number,
        .dark .ProseMirror .hljs-built_in {
          color: #fdba74;
        }
        
        .dark .ProseMirror .hljs-title,
        .dark .ProseMirror .hljs-function,
        .dark .ProseMirror .hljs-title.function_ {
          color: #93c5fd;
        }
        
        .dark .ProseMirror .hljs-comment,
        .dark .ProseMirror .hljs-quote {
          color: #94a3b8;
          font-style: italic;
        }
        
        .dark .ProseMirror .hljs-variable,
        .dark .ProseMirror .hljs-params,
        .dark .ProseMirror .hljs-template-variable {
          color: #fca5a5;
        }
        
        .dark .ProseMirror .hljs-operator,
        .dark .ProseMirror .hljs-punctuation {
          color: #67e8f9;
        }
        
        .dark .ProseMirror .hljs-meta,
        .dark .ProseMirror .hljs-regexp {
          color: #fde047;
        }
        
        .dark .ProseMirror .hljs-tag,
        .dark .ProseMirror .hljs-name {
          color: #fca5a5;
        }
        
        .dark .ProseMirror .hljs-class,
        .dark .ProseMirror .hljs-type,
        .dark .ProseMirror .hljs-title.class_ {
          color: #fde047;
        }
      `}</style>
      
      {/* Медиатека */}
      {showMediaLibrary && (
        taskId ? (
          <TaskMediaLibrary
            projectId={projectId}
            taskId={taskId}
            onImageSelect={(imagePath) => {
              if (editor) {
                editor.chain().focus().setImage({ src: imagePath }).run();
              }
            }}
            onClose={() => setShowMediaLibrary(false)}
          />
        ) : (
          <MediaLibrary
            projectId={projectId}
            onImageSelect={(imagePath) => {
              if (editor) {
                editor.chain().focus().setImage({ src: imagePath }).run();
              }
            }}
            onClose={() => setShowMediaLibrary(false)}
          />
        )
      )}
    </div>
  );
}
