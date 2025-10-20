'use server'

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';

type Task = {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  typeId?: number;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  userId?: number;
  companyId?: number;
  projectId?: number;
  dtc: string;
  dtu?: string;
  orderInStatus?: number;
  // Связанные данные
  statusName: string;
  priorityName?: string;
  executorName?: string;
  userName?: string;
  projectName?: string;
  companyName?: string;
  typeName?: string;
  typeColor?: string;
  // Иерархия
  level?: number;
  hasChildren?: boolean;
};

export async function getTasks(executorId?: number, companyId?: number): Promise<Task[]> {
  try {
    // Получаем текущего пользователя для фильтрации по компании
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('Пользователь не авторизован')
    }

    // Строим WHERE условие для фильтрации
    // Исключаем только "На паузе" и "Отменено" - для канбан доски нужны все остальные включая "Готово"
    let whereClause = "WHERE st.status NOT IN ('На паузе', 'Отменено')";
    const params: any = {};
    
    // Получаем все компании пользователя (собственные, где он член, и где он сотрудник)
    const userCompaniesResult = await query(`
      SELECT DISTINCT companyId 
      FROM User_Company 
      WHERE userId = @userId
      
      UNION
      
      SELECT id as companyId
      FROM Company
      WHERE ownerId = @userId
      
      UNION
      
      SELECT e.companyId
      FROM Employee e
      WHERE e.userId = @userId AND e.userId IS NOT NULL
    `, { userId: currentUser.id });

    const userCompanyIds = userCompaniesResult.map((row: any) => row.companyId);
    
    if (userCompanyIds.length > 0) {
      const placeholders = userCompanyIds.map((_, index) => `@companyId${index}`).join(',');
      whereClause += ` AND (t.companyId IN (${placeholders}) OR t.companyId IS NULL)`;
      
      userCompanyIds.forEach((companyId, index) => {
        params[`companyId${index}`] = companyId;
      });
    } else {
      // У пользователя НЕТ доступа ни к одной компании - показываем только его личные задачи
      whereClause += ` AND (t.companyId IS NULL AND t.userId = @userId)`;
      params.userId = currentUser.id;
    }
    
    if (executorId) {
      whereClause += " AND t.executorId = @executorId";
      params.executorId = executorId;
    }
    
    // Если есть фильтр по компании, получаем только задачи этой компании
    // (включая корневые задачи и их подзадачи только если они принадлежат этой компании)
    let allTasks;
    if (companyId) {
      // Получаем все задачи выбранной компании (и корневые, и подзадачи)
      const companyWhereClause = whereClause + " AND t.companyId = @selectedCompanyId";
      const companyParams = { ...params, selectedCompanyId: companyId };
      
      allTasks = await query(`
        SELECT 
          t.id,
          t.parentId,
          t.taskName,
          t.description,
          t.statusId,
          t.priorityId,
          t.typeId,
          t.startDate,
          t.dedline,
          t.executorId,
          t.userId,
          t.companyId,
          t.projectId,
          t.dtc,
          t.dtu,
          t.orderInStatus,
          st.status as statusName,
          p.priority as priorityName,
          e.Name as executorName,
          u.fullName as userName,
          pr.projectName,
          c.companyName,
          tt.typeName,
          tt.typeColor
        FROM Task t
        LEFT JOIN StatusTask st ON t.statusId = st.id
        LEFT JOIN Priority p ON t.priorityId = p.id
        LEFT JOIN Employee e ON t.executorId = e.id
        LEFT JOIN [Users] u ON t.userId = u.id
        LEFT JOIN Project pr ON t.projectId = pr.id
        LEFT JOIN Company c ON t.companyId = c.id
        LEFT JOIN TaskTypes tt ON t.typeId = tt.id
        ${companyWhereClause}
        ORDER BY COALESCE(t.orderInStatus, 999999), t.dtc DESC
      `, companyParams);
    } else {
      // Без фильтра по компании - получаем все доступные задачи
      allTasks = await query(`
        SELECT 
          t.id,
          t.parentId,
          t.taskName,
          t.description,
          t.statusId,
          t.priorityId,
          t.typeId,
          t.startDate,
          t.dedline,
          t.executorId,
          t.userId,
          t.companyId,
          t.projectId,
          t.dtc,
          t.dtu,
          t.orderInStatus,
          st.status as statusName,
          p.priority as priorityName,
          e.Name as executorName,
          u.fullName as userName,
          pr.projectName,
          c.companyName,
          tt.typeName,
          tt.typeColor
        FROM Task t
        LEFT JOIN StatusTask st ON t.statusId = st.id
        LEFT JOIN Priority p ON t.priorityId = p.id
        LEFT JOIN Employee e ON t.executorId = e.id
        LEFT JOIN [Users] u ON t.userId = u.id
        LEFT JOIN Project pr ON t.projectId = pr.id
        LEFT JOIN Company c ON t.companyId = c.id
        LEFT JOIN TaskTypes tt ON t.typeId = tt.id
        ${whereClause}
        ORDER BY COALESCE(t.orderInStatus, 999999), t.dtc DESC
      `, params);
    }    return buildTaskHierarchy(allTasks);
  } catch (error) {
    console.error('Ошибка при получении задач:', error);
    console.error('Детали ошибки:', error);
    throw new Error('Не удалось получить список задач');
  }
}

// Отдельная функция для получения выполненных задач
export async function getCompletedTasks(executorId?: number): Promise<Task[]> {
  try {
    // Получаем текущего пользователя для фильтрации по компании
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      throw new Error('Пользователь не авторизован')
    }

    // Строим WHERE условие для выполненных задач
    let whereClause = "WHERE st.status IN ('Готово')";
    const params: any = {};
    
    // Получаем все компании пользователя (собственные, где он член, и где он сотрудник)
    const userCompaniesResult = await query(`
      SELECT DISTINCT companyId 
      FROM User_Company 
      WHERE userId = @userId
      
      UNION
      
      SELECT id as companyId
      FROM Company
      WHERE ownerId = @userId
      
      UNION
      
      SELECT e.companyId
      FROM Employee e
      WHERE e.userId = @userId AND e.userId IS NOT NULL
    `, { userId: currentUser.id });

    const userCompanyIds = userCompaniesResult.map((row: any) => row.companyId);
    
    if (userCompanyIds.length > 0) {
      const placeholders = userCompanyIds.map((_, index) => `@companyId${index}`).join(',');
      whereClause += ` AND (t.companyId IN (${placeholders}) OR t.companyId IS NULL)`;
      
      userCompanyIds.forEach((companyId, index) => {
        params[`companyId${index}`] = companyId;
      });
    } else {
      // У пользователя НЕТ доступа ни к одной компании - показываем только его личные задачи
      whereClause += ` AND (t.companyId IS NULL AND t.userId = @userId)`;
      params.userId = currentUser.id;
    }
    
    if (executorId) {
      whereClause += " AND t.executorId = @executorId";
      params.executorId = executorId;
    }

    
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
        t.userId,
        t.companyId,
        t.projectId,
        t.dtc,
        t.dtu,
        t.orderInStatus,
        st.status as statusName,
        p.priority as priorityName,
        e.Name as executorName,
        u.fullName as userName,
        pr.projectName,
        c.companyName
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN Employee e ON t.executorId = e.id
      LEFT JOIN [Users] u ON t.userId = u.id
      LEFT JOIN Project pr ON t.projectId = pr.id
      LEFT JOIN Company c ON t.companyId = c.id
      ${whereClause}
      ORDER BY COALESCE(t.orderInStatus, 999999), t.dtu DESC, t.dtc DESC
    `, params);

    return buildTaskHierarchy(completedTasks);
  } catch (error) {
    console.error('Ошибка при получении выполненных задач:', error);
    throw new Error('Не удалось получить выполненные задачи');
  }
}

// Функция для получения всех задач (активные + выполненные)
// AM: не используется
export async function getAllTasks(executorId?: number): Promise<Task[]> {
  try {
    const [activeTasks, completedTasks] = await Promise.all([
      getTasks(executorId),
      getCompletedTasks(executorId)
    ]);
    
    // Объединяем задачи и сортируем по дате создания
    const allTasks = [...activeTasks, ...completedTasks];
    return allTasks.sort((a, b) => new Date(b.dtc).getTime() - new Date(a.dtc).getTime());
  } catch (error) {
    console.error('Ошибка при получении всех задач:', error);
    throw new Error('Не удалось получить все задачи');
  }
} // AM: не используется

// Выносим логику построения иерархии в отдельную функцию
function buildTaskHierarchy(tasks: any[]): Task[] {
  // Удаляем дубликаты задач по ID
  const uniqueTasks = Array.from(
    new Map(tasks.map(task => [task.id, task])).values()
  );
  
  // Построим иерархию в JavaScript
  const taskMap = new Map();
  const rootTasks: Task[] = [];

  // Создаем карту всех задач
  uniqueTasks.forEach((task: any) => {
    taskMap.set(task.id, {
      ...task,
      level: 0,
      hasChildren: false,
      children: []
    });
  });

  // Строим иерархию
  uniqueTasks.forEach((task: any) => {
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

// Функция для получения задач для выбора родителя (исключая текущую задачу и её потомков)
export async function getTasksForParentSelection(excludeTaskId?: number): Promise<{id: number, taskName: string, level: number}[]> {
  try {
    let whereClause = '';
    const params: any = {};
    
    if (excludeTaskId) {
      whereClause = `WHERE t.id != @excludeTaskId`;
      params.excludeTaskId = excludeTaskId;
    }
    
    const allTasks = await query(`
      SELECT 
        t.id,
        t.parentId,
        t.taskName
      FROM Task t
      ${whereClause}
      ORDER BY t.taskName
    `, params);

    // Построим иерархию в JavaScript
    const taskMap = new Map();
    const rootTasks: any[] = [];

    // Создаем карту всех задач
    allTasks.forEach((task: any) => {
      taskMap.set(task.id, {
        ...task,
        level: 0,
        children: []
      });
    });

    // Строим иерархию
    allTasks.forEach((task: any) => {
      const taskObj = taskMap.get(task.id);
      if (task.parentId) {
        const parent = taskMap.get(task.parentId);
        if (parent) {
          parent.children.push(taskObj);
        }
      } else {
        rootTasks.push(taskObj);
      }
    });

    // Функция для расчета уровней и создания плоского списка
    function flattenTasks(tasks: any[], level = 0): {id: number, taskName: string, level: number}[] {
      const result: {id: number, taskName: string, level: number}[] = [];
      tasks.forEach(task => {
        task.level = level;
        result.push({
          id: task.id,
          taskName: task.taskName,
          level: task.level
        });
        if (task.children && task.children.length > 0) {
          result.push(...flattenTasks(task.children, level + 1));
        }
      });
      return result;
    }

    return flattenTasks(rootTasks);
  } catch (error) {
    console.error('Ошибка при получении задач для выбора родителя:', error);
    throw new Error('Не удалось получить список задач');
  }
}

// Получить подзадачи для конкретной задачи (только первый уровень)
export async function getSubtasks(parentTaskId: number): Promise<Task[]> {
  try {
    const tasks = await query(`
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
        t.userId,
        t.companyId,
        t.projectId,
        t.dtc,
        t.dtu,
        st.status as statusName,
        p.priority as priorityName,
        e.Name as executorName,
        u.fullName as userName,
        pr.projectName,
        c.companyName,
        0 as level
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN [Users] u ON t.userId = u.id
      LEFT JOIN Employee e ON t.executorId = e.id
      LEFT JOIN Project pr ON t.projectId = pr.id
      LEFT JOIN Company c ON t.companyId = c.id
      WHERE t.parentId = @parentTaskId
      ORDER BY t.taskName
    `, { parentTaskId });

    return tasks;
  } catch (error) {
    console.error('Ошибка при получении подзадач:', error);
    throw new Error('Не удалось получить подзадачи');
  }
}
