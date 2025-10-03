'use client';

import React from 'react';

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactElement<any>;
};

export default function FormField({ label, htmlFor, required, hint, children }: FormFieldProps) {
  // Безопасно читаем props дочернего элемента
  const childProps = (children.props || {}) as any;
  const controlId: string | undefined = htmlFor ?? childProps.id;
  const isDisabled = Boolean(childProps.disabled);

  // Проверяем тип элемента
  const isTextarea = children.type === 'textarea';
  const isSelect = children.type === 'select';

  // Базовые классы для контрола с поддержкой темной темы
  const baseControlClasses = `
    w-full px-3 py-2 
    border border-gray-300 dark:border-gray-600 
    rounded-md text-base 
    bg-white dark:bg-gray-700 
    text-gray-900 dark:text-gray-100
    placeholder-gray-400 dark:placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent 
    transition-all duration-200
  `.trim();
  
  // Классы для disabled состояния
  const disabledClasses = isDisabled 
    ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-60' 
    : '';

  // Специальные классы для textarea
  const textareaClasses = isTextarea ? 'resize-y min-h-[100px]' : '';

  // Комбинируем классы, сохраняя пользовательские классы
  const controlClassName = `${baseControlClasses} ${disabledClasses} ${textareaClasses} ${childProps.className || ''}`.trim();

  // Клонируем элемент, добавляя id и className
  const control = React.cloneElement(children as React.ReactElement<any>, {
    ...childProps,
    id: controlId,
    className: controlClassName,
  });

  return (
    <div>
      <label 
        htmlFor={controlId} 
        className="block mb-2 font-semibold text-gray-700 dark:text-gray-200 text-sm"
      >
        {label}
        {required && <span className="text-red-500 dark:text-red-400 ml-1">*</span>}
      </label>
      {control}
      {hint && (
        <small className="text-gray-500 dark:text-gray-400 text-xs block mt-1.5">
          {hint}
        </small>
      )}
    </div>
  );
}