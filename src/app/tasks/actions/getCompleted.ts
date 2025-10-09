'use server';

import { query } from '@/db/connect';

export type Task = {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  dtc: string;
  dtu?: string;
  statusName: string;
  priorityName?: string;
  executorName?: string;
  level?: number;
  hasChildren?: boolean;
};

// Функция для построения иерархии задач
function buildTaskHierarchy(tasks: any[]): Task[] {
  const taskMap = new Map();
  const rootTasks: Task[] = [];

  // Создаем карту всех задач
  tasks.forEach((task: any) => {
    taskMap.set(task.id, {
      ...task,
      level: 0,
      hasChildren: false,
      children: []
    });
  });

  // Строим иерархию
  tasks.forEach((task: any) => {
    const taskObj = taskMap.get(task.id);
    if (task.parentId) {
      const parent = taskMap.get(task.parentId);
      if (parent) {
        parent.children.push(taskObj);
        parent.hasChildren = true;
      }
    } else {
      rootTasks.push(taskObj);
    }
  });

  // Функция для расчета уровней и создания плоского списка
  function flattenTasks(tasks: any[], level = 0): Task[] {
    const result: Task[] = [];
    tasks.forEach(task => {
      task.level = level;
      result.push(task);
      if (task.children && task.children.length > 0) {
        result.push(...flattenTasks(task.children, level + 1));
      }
    });
    return result;
  }

  return flattenTasks(rootTasks);
}

export async function getCompleted(executorId?: number): Promise<Task[]> {
  try {
    console.log('getCompleted вызван с executorId:', executorId);
    
    // Строим WHERE условие для выполненных задач (statusId = 5)
    let whereClause = "WHERE t.statusId = 5";
    const params: any = {};
    
    if (executorId) {
      whereClause += " AND t.executorId = @executorId";
      params.executorId = executorId;
    }
    
    console.log('SQL WHERE условие:', whereClause);
    console.log('SQL параметры:', params);
    
    const completedTasks = await query(`
      SELECT 
        t.id,
        t.parentId,
        t.taskName,
        t.description,
        t.statusId,
        t.priorityId,
        t.startDate,
        t.dedline,
        t.executorId,
        t.dtc,
        t.dtu,
        st.status as statusName,
        p.priority as priorityName,
        e.Name as executorName
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN Employee e ON t.executorId = e.id
      ${whereClause}
      ORDER BY t.dtu DESC, t.dtc DESC
    `, params);

    console.log('Результат SQL запроса:', completedTasks.length, 'задач');
    console.log('Полученные задачи:', completedTasks);

    const hierarchyResult = buildTaskHierarchy(completedTasks);
    console.log('После построения иерархии:', hierarchyResult.length, 'задач');
    
    return hierarchyResult;
  } catch (error) {
    console.error('Ошибка при получении выполненных задач:', error);
    throw new Error('Не удалось получить выполненные задачи');
  }
}
