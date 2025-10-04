'use server';

import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';

interface CreateProcessInput {
  stepName: string;
  stepOrder: number;
  description?: string;
  templateId: number;
}

export async function createProcess(input: CreateProcessInput) {
  try {
    const { stepName, stepOrder, description, templateId } = input;

    if (!stepName?.trim()) {
      return { success: false, error: 'Название шага обязательно' };
    }

    const result = await query(
      `INSERT INTO Process (stepName, stepOrder, description, templateId, dtc)
       OUTPUT INSERTED.id
       VALUES (@stepName, @stepOrder, @description, @templateId, GETDATE())`,
      {
        stepName: stepName.trim(),
        stepOrder,
        description: description?.trim() || null,
        templateId
      }
    );

    const resultArray = result as any[];
    revalidatePath('/templates');
    return { success: true, processId: resultArray[0]?.id };
  } catch (error) {
    console.error('createProcess error:', error);
    return { success: false, error: 'Ошибка при создании шага' };
  }
}

export async function updateProcess(processId: number, input: Omit<CreateProcessInput, 'templateId'>) {
  try {
    const { stepName, stepOrder, description } = input;

    if (!stepName?.trim()) {
      return { success: false, error: 'Название шага обязательно' };
    }

    await query(
      `UPDATE Process 
       SET stepName = @stepName, stepOrder = @stepOrder, description = @description, dtu = GETDATE()
       WHERE id = @processId`,
      {
        processId,
        stepName: stepName.trim(),
        stepOrder,
        description: description?.trim() || null
      }
    );

    revalidatePath('/templates');
    return { success: true };
  } catch (error) {
    console.error('updateProcess error:', error);
    return { success: false, error: 'Ошибка при обновлении шага' };
  }
}

export async function deleteProcess(processId: number) {
  try {
    await query(
      `DELETE FROM Process WHERE id = @processId`,
      { processId }
    );

    revalidatePath('/templates');
    return { success: true };
  } catch (error) {
    console.error('deleteProcess error:', error);
    return { success: false, error: 'Ошибка при удалении шага' };
  }
}

export async function reorderProcesses(templateId: number, processIds: number[]) {
  try {
    // Обновляем порядок всех процессов
    for (let i = 0; i < processIds.length; i++) {
      await query(
        `UPDATE Process 
         SET stepOrder = @stepOrder, dtu = GETDATE()
         WHERE id = @processId AND templateId = @templateId`,
        {
          processId: processIds[i],
          stepOrder: i + 1,
          templateId
        }
      );
    }

    revalidatePath('/templates');
    return { success: true };
  } catch (error) {
    console.error('reorderProcesses error:', error);
    return { success: false, error: 'Ошибка при изменении порядка шагов' };
  }
}
