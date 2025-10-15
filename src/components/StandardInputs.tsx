'use client';

import React from 'react';

interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Дополнительный класс */
  className?: string;
}

/**
 * Стандартный инпут с единообразными стилями
 */
export function StandardInput({ className = '', ...props }: StandardInputProps) {
  return (
    <input
      className={`
        w-full px-3 py-2 
        border border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-200
        rounded
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent
        disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
        placeholder:text-gray-400 dark:placeholder:text-gray-500
        transition-colors
        ${className}
      `}
      {...props}
    />
  );
}

interface StandardSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Дополнительный класс */
  className?: string;
  /** Опции для select */
  children: React.ReactNode;
}

/**
 * Стандартный select с единообразными стилями
 */
export function StandardSelect({ className = '', children, ...props }: StandardSelectProps) {
  return (
    <select
      className={`
        w-full px-3 py-2 
        border border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-200
        rounded
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent
        disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
  );
}

interface StandardTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Дополнительный класс */
  className?: string;
}

/**
 * Стандартная textarea с единообразными стилями
 */
export function StandardTextarea({ className = '', ...props }: StandardTextareaProps) {
  return (
    <textarea
      className={`
        w-full px-3 py-2 
        border border-gray-300 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-900 dark:text-gray-200
        rounded
        resize-vertical
        focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent
        disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed
        placeholder:text-gray-400 dark:placeholder:text-gray-500
        transition-colors
        ${className}
      `}
      {...props}
    />
  );
}