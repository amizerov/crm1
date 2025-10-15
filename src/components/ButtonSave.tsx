interface ButtonSaveProps {
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export default function ButtonSave({ children = 'Сохранить', disabled = false, className = '' }: ButtonSaveProps) {
    return (
        <button 
          type="submit" 
          disabled={disabled}
          className={`
            px-6 py-3 
            bg-blue-900 dark:bg-blue-700
            hover:bg-blue-800 dark:hover:bg-blue-600
            disabled:bg-gray-500 disabled:cursor-not-allowed disabled:opacity-60
            text-white font-medium
            rounded transition-colors
            cursor-pointer
            ${className}
          `}
        >
          {children}
        </button>
    );
}