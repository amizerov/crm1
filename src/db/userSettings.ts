'use server';

import { query, sql } from './connect';
import crypto from 'crypto';

/**
 * Генерирует DeviceId на основе переданных параметров
 * В реальном приложении deviceId должен генерироваться на клиенте
 */
function generateDeviceId(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Получить настройки пользователя
 * @param userId - ID пользователя
 * @param deviceId - ID устройства (опционально)
 */
export async function getUserSettings(userId: number, deviceId?: string): Promise<string | null> {
  try {
    let queryText: string;
    let params: any = { userId };
    
    if (deviceId) {
      params.deviceId = deviceId;
      queryText = `
        SELECT settingsJson 
        FROM UserSettings 
        WHERE userId = @userId AND DeviceId = @deviceId
      `;
    } else {
      // Получаем первые найденные настройки пользователя
      queryText = `
        SELECT TOP 1 settingsJson 
        FROM UserSettings 
        WHERE userId = @userId
        ORDER BY updatedAt DESC
      `;
    }
    
    const result = await query(queryText, params);
    
    if (result && result.length > 0) {
      return result[0].settingsJson;
    }
    
    return null;
  } catch (error) {
    console.error('Ошибка при получении настроек пользователя:', error);
    return null;
  }
}

/**
 * Сохранить настройки пользователя
 * @param userId - ID пользователя
 * @param settingsJson - JSON строка с настройками
 * @param deviceId - ID устройства (опционально)
 */
export async function saveUserSettings(
  userId: number, 
  settingsJson: string, 
  deviceId?: string
): Promise<{ success: boolean; deviceId?: string }> {
  try {
    // Если deviceId не передан, генерируем новый
    const finalDeviceId = deviceId || generateDeviceId();
    
    // Используем MERGE для атомарной операции
    const queryText = `
      MERGE UserSettings AS target
      USING (SELECT @userId AS userId, @deviceId AS DeviceId) AS source
      ON target.userId = source.userId AND target.DeviceId = source.DeviceId
      WHEN MATCHED THEN
        UPDATE SET 
          settingsJson = @settingsJson,
          updatedAt = GETDATE()
      WHEN NOT MATCHED THEN
        INSERT (userId, DeviceId, settingsJson, createdAt, updatedAt)
        VALUES (@userId, @deviceId, @settingsJson, GETDATE(), GETDATE());
    `;
    
    await query(queryText, {
      userId,
      deviceId: finalDeviceId,
      settingsJson
    });
    
    return { success: true, deviceId: finalDeviceId };
  } catch (error) {
    console.error('Ошибка при сохранении настроек пользователя:', error);
    return { success: false };
  }
}

/**
 * Удалить настройки пользователя для конкретного устройства
 * @param userId - ID пользователя
 * @param deviceId - ID устройства
 */
export async function deleteUserSettings(userId: number, deviceId: string): Promise<boolean> {
  try {
    const queryText = `
      DELETE FROM UserSettings 
      WHERE userId = @userId AND DeviceId = @deviceId
    `;
    
    await query(queryText, { userId, deviceId });
    return true;
  } catch (error) {
    console.error('Ошибка при удалении настроек пользователя:', error);
    return false;
  }
}

/**
 * Получить все настройки пользователя для всех устройств
 * @param userId - ID пользователя
 */
export async function getAllUserSettings(userId: number): Promise<Array<{deviceId: string, settingsJson: string, updatedAt: Date}>> {
  try {
    const queryText = `
      SELECT DeviceId as deviceId, settingsJson, updatedAt
      FROM UserSettings 
      WHERE userId = @userId
      ORDER BY updatedAt DESC
    `;
    
    const result = await query(queryText, { userId });
    return result || [];
  } catch (error) {
    console.error('Ошибка при получении всех настроек пользователя:', error);
    return [];
  }
}