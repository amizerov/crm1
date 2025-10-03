'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

type InteractiveCardProps = {
  href: string;
  children: ReactNode;
  style?: React.CSSProperties;
};

export default function InteractiveCard({ href, children, style }: InteractiveCardProps) {
  const baseStyle = style || {};
  
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div 
        style={baseStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#e9ecef';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#f8f9fa';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {children}
      </div>
    </Link>
  );
}
