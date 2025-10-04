'use server';

import { query } from '@/db/connect';

export interface Template {
  id: number;
  templName: string;
  description?: string;
  dtc: string;
}

export async function getTemplates(): Promise<Template[]> {
  try {
    const result = await query(
      `SELECT id, templName, description, dtc 
       FROM Template 
       ORDER BY templName`
    );
    return result as Template[];
  } catch (error) {
    console.error('getTemplates error:', error);
    return [];
  }
}
