import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from 'mssql';
import { connectDB } from '@/db/connect';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');
    
    if (!userIdCookie) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const userId = parseInt(userIdCookie.value);
    const { taskName, statusId, companyId } = await request.json();

    if (!taskName || !statusId || !companyId) {
      return NextResponse.json({ error: 'Недостаточно данных' }, { status: 400 });
    }

    const pool = await connectDB();
    
    // Создаем задачу
    const result = await pool.request()
      .input('taskName', sql.NVarChar, taskName)
      .input('statusId', sql.Int, statusId)
      .input('companyId', sql.Int, companyId)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO Task (taskName, statusId, companyId, userId, dtc)
        OUTPUT INSERTED.id
        VALUES (@taskName, @statusId, @companyId, @userId, GETDATE())
      `);

    const newTaskId = result.recordset[0].id;

    return NextResponse.json({ 
      success: true, 
      taskId: newTaskId 
    });

  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании задачи' },
      { status: 500 }
    );
  }
}
