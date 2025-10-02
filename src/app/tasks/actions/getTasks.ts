import { query } from '@/db/connect';
import { getCurrentUser } from '@/db/loginUser';

type Task = {
  id: number;
  parentId?: number;
  taskName: string;
  description?: string;
  statusId: number;
  priorityId?: number;
  startDate?: string;
  dedline?: string;
  executorId?: number;
  userId?: number;
  companyId?: number;
  dtc: string;
  dtu?: string;
  // Связанные данные
  statusName: string;
  priorityName?: string;
  executorName?: string;
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
    let whereClause = "WHERE st.status NOT IN ('Готово', 'Отменено')";
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
    
    console.log('getTasks - whereClause:', whereClause);
    console.log('getTasks - params:', params);
    
    // Если есть фильтр по компании, сначала получаем задачи компании, 
    // а затем добавляем все их подзадачи независимо от companyId
    let allTasks;
    if (companyId) {
      // Получаем задачи выбранной компании
      const companyWhereClause = whereClause + " AND t.companyId = @selectedCompanyId";
      const companyParams = { ...params, selectedCompanyId: companyId };
      
      const companyTasks = await query(`
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
          t.dtc,
          t.dtu,
          st.status as statusName,
          p.priority as priorityName,
          e.Name as executorName
        FROM Task t
        LEFT JOIN StatusTask st ON t.statusId = st.id
        LEFT JOIN Priority p ON t.priorityId = p.id
        LEFT JOIN Employee e ON t.executorId = e.id
        ${companyWhereClause}
        ORDER BY t.dtc DESC
      `, companyParams);

      // Получаем ID всех задач компании для поиска их подзадач
      const taskIds = companyTasks.map(task => task.id);
      
      if (taskIds.length > 0) {
        // Получаем все подзадачи для задач компании (рекурсивно)
        const taskIdsPlaceholders = taskIds.map((_, index) => `@taskId${index}`).join(',');
        const subtaskParams = { ...params };
        taskIds.forEach((taskId, index) => {
          subtaskParams[`taskId${index}`] = taskId;
        });

        const subtasks = await query(`
          WITH TaskHierarchy AS (
            -- Базовый случай: задачи компании
            SELECT t.id, t.parentId, t.taskName, t.description, t.statusId, t.priorityId, 
                   t.startDate, t.dedline, t.executorId, t.userId, t.companyId, t.dtc, t.dtu
            FROM Task t
            WHERE t.id IN (${taskIdsPlaceholders})
            AND t.statusId NOT IN (SELECT id FROM StatusTask WHERE status IN ('Готово', 'Отменено'))
            
            UNION ALL
            
            -- Рекурсивный случай: подзадачи
            SELECT t.id, t.parentId, t.taskName, t.description, t.statusId, t.priorityId,
                   t.startDate, t.dedline, t.executorId, t.userId, t.companyId, t.dtc, t.dtu
            FROM Task t
            INNER JOIN TaskHierarchy th ON t.parentId = th.id
            WHERE t.statusId NOT IN (SELECT id FROM StatusTask WHERE status IN ('Готово', 'Отменено'))
          )
          SELECT th.id, th.parentId, th.taskName, th.description, th.statusId, th.priorityId,
                 th.startDate, th.dedline, th.executorId, th.userId, th.companyId, th.dtc, th.dtu,
                 st.status as statusName, p.priority as priorityName, e.Name as executorName
          FROM TaskHierarchy th
          LEFT JOIN StatusTask st ON th.statusId = st.id
          LEFT JOIN Priority p ON th.priorityId = p.id
          LEFT JOIN Employee e ON th.executorId = e.id
          ORDER BY th.dtc DESC
        `, subtaskParams);

        allTasks = subtasks;
      } else {
        allTasks = companyTasks;
      }
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
          t.startDate,
          t.dedline,
          t.executorId,
          t.userId,
          t.companyId,
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
        ORDER BY t.dtc DESC
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
  // Построим иерархию в JavaScript
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
        t.dtc,
        t.dtu,
        st.status as statusName,
        p.priority as priorityName,
        e.Name as executorName,
        0 as level
      FROM Task t
      LEFT JOIN StatusTask st ON t.statusId = st.id
      LEFT JOIN Priority p ON t.priorityId = p.id
      LEFT JOIN Employee e ON t.executorId = e.id
      WHERE t.parentId = @parentTaskId
      ORDER BY t.taskName
    `, { parentTaskId });

    return tasks;
  } catch (error) {
    console.error('Ошибка при получении подзадач:', error);
    throw new Error('Не удалось получить подзадачи');
  }
}
