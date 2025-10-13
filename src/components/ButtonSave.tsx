interface ButtonSaveProps {
  children?: React.ReactNode;
  disabled?: boolean;
}

export default function ButtonSave({ children = 'Сохранить', disabled = false }: ButtonSaveProps) {
    return (
        <button 
          type="submit" 
          disabled={disabled}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: disabled ? '#6c757d' : '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1
          }}
        >
          {children}
        </button>
    );
}