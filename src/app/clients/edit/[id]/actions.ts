'use server';

import { deleteClient } from '../../actions';
import { revalidatePath } from 'next/cache';

export async function handleDeleteClient(clientId: number) {
  try {
    await deleteClient(clientId);
    revalidatePath('/clients');
  } catch (error) {
    console.error('Ошибка при удалении клиента:', error);
    throw new Error('Не удалось удалить клиента');
  }
}
