'use server';

import { updateEmployee, deleteEmployee } from '../../actions';

export async function updateEmployeeAction(formData: FormData) {
  const params = {
    id: Number(formData.get('id')),
    Name: formData.get('Name') as string || undefined,
    userId: formData.get('userId') ? Number(formData.get('userId')) : undefined,
    companyId: formData.get('companyId') ? Number(formData.get('companyId')) : undefined,
  };

  // Обрабатываем пустые строки как undefined для userId и companyId
  if (formData.get('userId') === '') {
    params.userId = undefined; // Это будет означать сброс связи (NULL в БД)
  }
  
  if (formData.get('companyId') === '') {
    params.companyId = undefined; // Это будет означать сброс связи (NULL в БД)
  }

  await updateEmployee(params);
}

export async function deleteEmployeeAction(formData: FormData) {
  const id = Number(formData.get('id'));
  await deleteEmployee(id);
}
