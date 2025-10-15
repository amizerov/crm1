'use client';

import React from 'react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface TableBaseProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
  addButtonText?: string;
  addButtonLink?: string;
  className?: string;
}

export default function TableBase<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  loading = false,
  emptyMessage = 'Нет данных для отображения',
  addButtonText,
  addButtonLink,
  className = ''
}: TableBaseProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg mb-4">{emptyMessage}</p>
        {addButtonText && addButtonLink && (
          <a 
            href={addButtonLink}
            className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            {addButtonText}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            {columns.map((column, columnIndex) => (
              <th
                key={String(column.key)}
                className={`
                  px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300
                  ${column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'}
                  ${columnIndex < columns.length - 1 ? 'border-r border-gray-200 dark:border-gray-600' : ''}
                `}
                style={{ width: column.width }}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={`
                border-b border-gray-200 dark:border-gray-700 last:border-b-0
                ${onRowClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : ''}
                transition-colors
              `}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={String(column.key)}
                  className={`
                    px-4 py-3 text-sm text-gray-900 dark:text-gray-100
                    ${column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'}
                    ${column.className || ''}
                    ${columnIndex < columns.length - 1 ? 'border-r border-gray-200 dark:border-gray-600' : ''}
                  `}
                >
                  {column.render 
                    ? column.render(row)
                    : row[column.key] || '-'
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}