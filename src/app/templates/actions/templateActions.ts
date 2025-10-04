'use server';

import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';

interface CreateTemplateInput {
  templName: string;
  description?: string;
}

export async function createTemplate(input: CreateTemplateInput) {
  try {
    const { templName, description } = input;

    if (!templName?.trim()) {
      return { success: false, error: 'Название шаблона обязательно' };
    }

    const result = await query(
      `INSERT INTO Template (templName, description, dtc)
       OUTPUT INSERTED.id
       VALUES (@templName, @description, GETDATE())`,
      {
        templName: templName.trim(),
        description: description?.trim() || null
      }
    );

    const resultArray = result as any[];
    revalidatePath('/templates');
    return { success: true, templateId: resultArray[0]?.id };
  } catch (error) {
    console.error('createTemplate error:', error);
    return { success: false, error: 'Ошибка при создании шаблона' };
  }
}

export async function updateTemplate(templateId: number, input: CreateTemplateInput) {
  try {
    const { templName, description } = input;

    if (!templName?.trim()) {
      return { success: false, error: 'Название шаблона обязательно' };
    }

    await query(
      `UPDATE Template 
       SET templName = @templName, description = @description
       WHERE id = @templateId`,
      {
        templateId,
        templName: templName.trim(),
        description: description?.trim() || null
      }
    );

    revalidatePath('/templates');
    return { success: true };
  } catch (error) {
    console.error('updateTemplate error:', error);
    return { success: false, error: 'Ошибка при обновлении шаблона' };
  }
}

export async function deleteTemplate(templateId: number) {
  try {
    // Сначала удаляем все процессы шаблона
    await query(
      `DELETE FROM Process WHERE templateId = @templateId`,
      { templateId }
    );

    // Затем удаляем сам шаблон
    await query(
      `DELETE FROM Template WHERE id = @templateId`,
      { templateId }
    );

    revalidatePath('/templates');
    return { success: true };
  } catch (error) {
    console.error('deleteTemplate error:', error);
    return { success: false, error: 'Ошибка при удалении шаблона' };
  }
}
