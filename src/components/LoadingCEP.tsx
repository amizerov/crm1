interface LoadingCEPProps {
  message: string;
}

export default function LoadingCEP({ message }: LoadingCEPProps) {
  return (
    <div style={{ 
      padding: '20px 0', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '400px' 
    }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: 16 
      }}>
        <div style={{ 
          width: 40, 
          height: 40, 
          border: '4px solid #f3f3f3', 
          borderTop: '4px solid #28a745', 
          borderRadius: '50%', 
          animation: 'spin 1s linear infinite' 
        }}></div>
        <p style={{ 
          margin: 0, 
          color: '#666', 
          fontSize: 14 
        }}>
          {message}
        </p>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}