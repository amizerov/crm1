'use server';

import { deleteProject as deleteProjectAction } from '../../actions';

export async function deleteProject(id: number) {
  return await deleteProjectAction(id);
}
