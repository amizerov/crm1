'use client';

import React from 'react';
import { COMPONENT_STYLES } from '@/styles/constants';

interface StandardInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Дополнительные стили */
  style?: React.CSSProperties;
}

/**
 * Стандартный инпут с единообразными стилями
 */
export function StandardInput({ style, onFocus, onBlur, ...props }: StandardInputProps) {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    Object.assign(e.target.style, COMPONENT_STYLES.inputFocus);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = COMPONENT_STYLES.input.border.split(' ')[2];
    e.target.style.boxShadow = 'none';
    onBlur?.(e);
  };

  return (
    <input
      style={{
        ...COMPONENT_STYLES.input,
        ...style
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    />
  );
}

interface StandardSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Дополнительные стили */
  style?: React.CSSProperties;
  /** Опции для select */
  children: React.ReactNode;
}

/**
 * Стандартный select с единообразными стилями
 */
export function StandardSelect({ style, children, onFocus, onBlur, ...props }: StandardSelectProps) {
  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    Object.assign(e.target.style, COMPONENT_STYLES.inputFocus);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = COMPONENT_STYLES.input.border.split(' ')[2];
    e.target.style.boxShadow = 'none';
    onBlur?.(e);
  };

  return (
    <select
      style={{
        ...COMPONENT_STYLES.input,
        ...style
      }}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
    </select>
  );
}

interface StandardTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Дополнительные стили */
  style?: React.CSSProperties;
}

/**
 * Стандартная textarea с единообразными стилями
 */
export function StandardTextarea({ style, ...props }: StandardTextareaProps) {
  return (
    <textarea
      style={{
        ...COMPONENT_STYLES.input,
        resize: 'vertical',
        fontFamily: 'inherit',
        ...style
      }}
      {...props}
    />
  );
}