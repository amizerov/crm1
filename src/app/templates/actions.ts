'use server'

import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import sql from 'mssql';

export interface Process {
  id: number;
  projectId: number;
  stepName: string;
  stepOrder: number;
  isTemplate: boolean;
  dtc: string;
  dtu?: string;
  projectName?: string;
}

// Получить все шаблоны процессов (isTemplate = 1)
export async function getTemplates(): Promise<Process[]> {
  try {
    const result = await query(
      `SELECT 
        p.id,
        p.projectId,
        p.stepName,
        p.stepOrder,
        p.isTemplate,
        p.dtc,
        p.dtu,
        pr.projectName
      FROM Process p
      LEFT JOIN Project pr ON p.projectId = pr.id
      WHERE p.isTemplate = 1
      ORDER BY p.stepOrder, p.dtc DESC`
    );
    return (result || []) as Process[];
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

// Получить шаблон по ID
export async function getTemplateById(id: number): Promise<Process | null> {
  try {
    const result = await query(
      `SELECT 
        p.id,
        p.projectId,
        p.stepName,
        p.stepOrder,
        p.isTemplate,
        p.dtc,
        p.dtu,
        pr.projectName
      FROM Process p
      LEFT JOIN Project pr ON p.projectId = pr.id
      WHERE p.id = @id`,
      { id }
    );
    return (result?.[0] as Process) || null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

// Создать новый шаблон
export async function createTemplate(formData: FormData) {
  try {
    const projectId = parseInt(formData.get('projectId') as string);
    const stepName = formData.get('stepName') as string;
    const stepOrder = parseInt(formData.get('stepOrder') as string);

    if (!projectId || !stepName || !stepOrder) {
      throw new Error('Не все обязательные поля заполнены');
    }

    await query(
      `INSERT INTO Process (projectId, stepName, stepOrder, isTemplate, dtc)
       VALUES (@projectId, @stepName, @stepOrder, 1, GETDATE())`,
      { projectId, stepName, stepOrder }
    );

    revalidatePath('/templates');
    redirect('/templates');
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
}

// Обновить шаблон
export async function updateTemplate(id: number, formData: FormData) {
  try {
    const projectId = parseInt(formData.get('projectId') as string);
    const stepName = formData.get('stepName') as string;
    const stepOrder = parseInt(formData.get('stepOrder') as string);

    if (!projectId || !stepName || !stepOrder) {
      throw new Error('Не все обязательные поля заполнены');
    }

    await query(
      `UPDATE Process 
       SET projectId = @projectId,
           stepName = @stepName,
           stepOrder = @stepOrder,
           dtu = GETDATE()
       WHERE id = @id`,
      { id, projectId, stepName, stepOrder }
    );

    revalidatePath('/templates');
    redirect('/templates');
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
}

// Удалить шаблон
export async function deleteTemplate(id: number) {
  try {
    await query(
      'DELETE FROM Process WHERE id = @id',
      { id }
    );

    revalidatePath('/templates');
    redirect('/templates');
  } catch (error) {
    console.error('Error deleting template:', error);
    throw error;
  }
}

// Получить все проекты для выбора
export async function getProjects(): Promise<Array<{ id: number; projectName: string; companyName?: string }>> {
  try {
    const result = await query(
      `SELECT 
        p.id,
        p.projectName,
        c.companyName
      FROM Project p
      LEFT JOIN Company c ON p.companyId = c.id
      ORDER BY p.projectName`
    );
    return (result || []) as Array<{ id: number; projectName: string; companyName?: string }>;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}
