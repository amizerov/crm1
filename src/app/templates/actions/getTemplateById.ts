'use server';

import { query } from '@/db/connect';

export interface Process {
  id: number;
  stepName: string;
  stepOrder: number;
  description?: string;
  templateId: number;
  dtc: string;
  dtu?: string;
}

export interface TemplateWithProcesses {
  id: number;
  templName: string;
  description?: string;
  dtc: string;
  processes: Process[];
}

export async function getTemplateById(templateId: number): Promise<TemplateWithProcesses | null> {
  try {
    const [templates, processes] = await Promise.all([
      query(
        `SELECT id, templName, description, dtc 
         FROM Template 
         WHERE id = @templateId`,
        { templateId }
      ),
      query(
        `SELECT id, stepName, stepOrder, description, templateId, dtc, dtu 
         FROM Process 
         WHERE templateId = @templateId 
         ORDER BY stepOrder`,
        { templateId }
      )
    ]);

    const templateResult = templates as any[];
    const processResult = processes as Process[];

    if (templateResult.length === 0) return null;

    return {
      ...templateResult[0],
      processes: processResult
    };
  } catch (error) {
    console.error('getTemplateById error:', error);
    return null;
  }
}
