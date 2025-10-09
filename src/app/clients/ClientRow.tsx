'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Client = {
  id: number;
  clientName: string;
  description?: string;
  contacts?: string;
  statusId: number;
  companyId?: number;
  companyName?: string;
  summa?: number;
  payDate?: string;
  payType?: string;
  dtc: string;
  dtu?: string;
};

type ClientRowProps = {
  client: Client;
  statusName: string;
};

export default function ClientRow({ client, statusName }: ClientRowProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    router.push(`/clients/edit/${client.id}`);
  };

  return (
    <tr 
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        cursor: 'pointer',
        backgroundColor: isHovered ? '#f8f9fa' : 'transparent',
        transition: 'background-color 0.2s ease'
      }}
    >
      <td style={{ padding: 12, border: '1px solid #ddd' }}>{client.id}</td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>{client.clientName}</td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>{client.companyName || '-'}</td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>{client.description || '-'}</td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>{client.contacts || '-'}</td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>{statusName}</td>
      <td style={{ padding: 12, border: '1px solid #ddd' }}>{client.summa || '-'}</td>
    </tr>
  );
}
