'use server'

import { updateTemplate, deleteTemplate } from '../../actions';

export async function handleUpdateTemplate(id: number, formData: FormData) {
  return updateTemplate(id, formData);
}

export async function handleDeleteTemplate(id: number) {
  return deleteTemplate(id);
}
