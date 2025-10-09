interface TooltipProps {
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ message, position = 'top' }: TooltipProps) {
  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return {
          tooltip: {
            top: '-60px',
            left: '50%',
            transform: 'translateX(-50%)'
          },
          arrow: {
            bottom: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #ffc107',
            borderBottom: 'none'
          }
        };
      case 'bottom':
        return {
          tooltip: {
            bottom: '-60px',
            left: '50%',
            transform: 'translateX(-50%)'
          },
          arrow: {
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: '8px solid #ffc107',
            borderTop: 'none'
          }
        };
      case 'left':
        return {
          tooltip: {
            left: '-120px',
            top: '50%',
            transform: 'translateY(-50%)'
          },
          arrow: {
            right: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '8px solid #ffc107',
            borderRight: 'none'
          }
        };
      case 'right':
        return {
          tooltip: {
            right: '-120px',
            top: '50%',
            transform: 'translateY(-50%)'
          },
          arrow: {
            left: '-8px',
            top: '50%',
            transform: 'translateY(-50%)',
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid #ffc107',
            borderLeft: 'none'
          }
        };
      default:
        return {
          tooltip: {},
          arrow: {}
        };
    }
  };

  const styles = getPositionStyles();

  return (
    <div style={{
      position: 'absolute',
      backgroundColor: '#fff',
      border: '2px solid #ffc107',
      borderRadius: '8px',
      padding: '8px 12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      whiteSpace: 'nowrap',
      fontSize: '14px',
      fontWeight: '500',
      color: '#856404',
      animation: 'fadeIn 0.3s ease',
      pointerEvents: 'none',
      ...styles.tooltip
    }}>
      {message}
      {/* Стрелка */}
      <div style={{
        position: 'absolute',
        width: 0,
        height: 0,
        ...styles.arrow
      }} />
    </div>
  );
}
