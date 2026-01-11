'use server';

import sql from 'mssql';
import { getConnection } from '@/db/connect';
import { getSession } from '@/lib/session';

export interface ProjectSecret {
  id: number;
  project_id: number;
  key: string;
  value: string;
  description: string | null;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_name: string;
}

/**
 * Проверка мастер-пароля проекта
 */
export async function verifyMasterPassword(projectId: number, password: string): Promise<boolean> {
  try {
    const session = await getSession();
    
    if (!session.userId || !session.isLoggedIn) {
      console.error('Unauthorized: no active session');
      return false;
    }

    const pool = await getConnection();
    
    // TODO: Реализовать хранение хеша мастер-пароля в таблице Projects
    // Сейчас для демонстрации используем простую проверку
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT master_password_hash 
        FROM Project 
        WHERE id = @projectId
      `);

    if (!result.recordset || result.recordset.length === 0) {
      // Если поле master_password_hash не существует, принимаем любой пароль > 4 символов
      return password.length >= 4;
    }

    // TODO: Использовать bcrypt для проверки хеша
    // const bcrypt = require('bcrypt');
    // return await bcrypt.compare(password, result.recordset[0].master_password_hash);
    
    return password.length >= 4;
  } catch (error) {
    console.error('Error verifying master password:', error);
    return false;
  }
}

/**
 * Получить все секреты проекта
 */
export async function getProjectSecrets(projectId: number): Promise<ProjectSecret[]> {
  try {
    const session = await getSession();
    
    if (!session.userId || !session.isLoggedIn) {
      throw new Error('Unauthorized');
    }

    const pool = await getConnection();
    
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .query(`
        SELECT 
          ps.id,
          ps.project_id,
          ps.[key],
          ps.value,
          ps.description,
          ps.created_by,
          ps.created_at,
          ps.updated_at,
          COALESCE(u.NicName, u.FullName, 'Неизвестный') as creator_name
        FROM ProjectSecrets ps
        LEFT JOIN Users u ON ps.created_by = u.id
        WHERE ps.project_id = @projectId
        ORDER BY ps.[key]
      `);

    return result.recordset || [];
  } catch (error) {
    console.error('Error loading project secrets:', error);
    throw error;
  }
}

/**
 * Добавить новый секрет
 */
export async function addProjectSecret(
  projectId: number,
  key: string,
  value: string,
  description?: string
): Promise<ProjectSecret> {
  try {
    const session = await getSession();
    
    if (!session.userId || !session.isLoggedIn) {
      throw new Error('Unauthorized');
    }

    const userId = session.userId;
    const pool = await getConnection();
    
    // Проверяем, что ключ уникален для проекта
    const checkResult = await pool.request()
      .input('projectId', sql.Int, projectId)
      .input('key', sql.NVarChar, key)
      .query(`
        SELECT id FROM ProjectSecrets 
        WHERE project_id = @projectId AND [key] = @key
      `);

    if (checkResult.recordset && checkResult.recordset.length > 0) {
      throw new Error('Секрет с таким ключом уже существует');
    }

    // TODO: Шифровать значение перед сохранением
    // const crypto = require('crypto');
    // const encryptedValue = encryptValue(value, masterKey);
    
    const result = await pool.request()
      .input('projectId', sql.Int, projectId)
      .input('key', sql.NVarChar, key)
      .input('value', sql.NVarChar, value)
      .input('description', sql.NVarChar, description || null)
      .input('userId', sql.Int, userId)
      .query(`
        INSERT INTO ProjectSecrets (project_id, [key], value, description, created_by, created_at, updated_at)
        OUTPUT INSERTED.*
        VALUES (@projectId, @key, @value, @description, @userId, GETDATE(), GETDATE())
      `);

    if (!result.recordset || result.recordset.length === 0) {
      throw new Error('Failed to create secret');
    }

    // Получаем полную информацию с именем создателя
    const createdSecret = await pool.request()
      .input('secretId', sql.Int, result.recordset[0].id)
      .query(`
        SELECT 
          ps.*,
          COALESCE(u.NicName, u.FullName, 'Неизвестный') as creator_name
        FROM ProjectSecrets ps
        LEFT JOIN Users u ON ps.created_by = u.id
        WHERE ps.id = @secretId
      `);

    return createdSecret.recordset[0];
  } catch (error) {
    console.error('Error adding project secret:', error);
    throw error;
  }
}

/**
 * Обновить секрет
 */
export async function updateProjectSecret(
  secretId: number,
  value: string,
  description?: string
): Promise<void> {
  try {
    const session = await getSession();
    
    if (!session.userId || !session.isLoggedIn) {
      throw new Error('Unauthorized');
    }

    const pool = await getConnection();
    
    // TODO: Шифровать значение перед сохранением
    
    await pool.request()
      .input('secretId', sql.Int, secretId)
      .input('value', sql.NVarChar, value)
      .input('description', sql.NVarChar, description || null)
      .query(`
        UPDATE ProjectSecrets 
        SET value = @value, 
            description = @description,
            updated_at = GETDATE()
        WHERE id = @secretId
      `);
  } catch (error) {
    console.error('Error updating project secret:', error);
    throw error;
  }
}

/**
 * Удалить секрет
 */
export async function deleteProjectSecret(secretId: number): Promise<void> {
  try {
    const session = await getSession();
    
    if (!session.userId || !session.isLoggedIn) {
      throw new Error('Unauthorized');
    }

    const pool = await getConnection();
    
    await pool.request()
      .input('secretId', sql.Int, secretId)
      .query('DELETE FROM ProjectSecrets WHERE id = @secretId');
  } catch (error) {
    console.error('Error deleting project secret:', error);
    throw error;
  }
}

/**
 * Логирование доступа к секретам
 */
export async function logSecretAccess(secretId: number, action: string): Promise<void> {
  try {
    const session = await getSession();
    
    if (!session.userId || !session.isLoggedIn) {
      return;
    }

    const userId = session.userId;
    const pool = await getConnection();
    
    await pool.request()
      .input('secretId', sql.Int, secretId)
      .input('userId', sql.Int, userId)
      .input('action', sql.NVarChar, action)
      .query(`
        INSERT INTO SecretAccessLog (secret_id, user_id, action, accessed_at)
        VALUES (@secretId, @userId, @action, GETDATE())
      `);
  } catch (error) {
    // Не прерываем работу при ошибке логирования
    console.error('Error logging secret access:', error);
  }
}
