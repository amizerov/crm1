import { query } from '../../../db/connect';

export async function getBankAccountByCompanyId(companyId: number) {
  try {
    const bankAccounts = await query(`
      SELECT 
        id,
        companyId,
        bankName,
        bankAccount,
        bankBik,
        inn,
        kpp
      FROM BankAccount
      WHERE companyId = @companyId
    `, { companyId });
    
    return bankAccounts.length > 0 ? bankAccounts[0] : null;
  } catch (error) {
    console.error('Ошибка при получении банковского счета:', error);
    return null;
  }
}

export async function updateBankAccount(companyId: number, bankData: {
  bankName: string;
  bankAccount: string;
  bankBik: string;
  inn: string;
  kpp?: string;
}) {
  try {
    // Проверяем, существует ли уже запись
    const existing = await getBankAccountByCompanyId(companyId);
    
    if (existing) {
      // Обновляем существующую запись
      await query(`
        UPDATE BankAccount SET 
          bankName = @bankName,
          bankAccount = @bankAccount,
          bankBik = @bankBik,
          inn = @inn,
          kpp = @kpp
        WHERE companyId = @companyId
      `, {
        companyId,
        bankName: bankData.bankName.trim() || null,
        bankAccount: bankData.bankAccount.trim() || null,
        bankBik: bankData.bankBik.trim() || null,
        inn: bankData.inn.trim() || null,
        kpp: bankData.kpp?.trim() || null
      });
    } else {
      // Создаем новую запись, если есть данные для сохранения
      if (bankData.bankName || bankData.bankAccount || bankData.bankBik || bankData.inn) {
        // Получаем следующий ID
        const maxIdResult = await query('SELECT ISNULL(MAX(id), 0) + 1 as nextId FROM BankAccount');
        const nextId = maxIdResult[0].nextId;
        
        await query(`
          INSERT INTO BankAccount (id, companyId, bankName, bankAccount, bankBik, inn, kpp)
          VALUES (@id, @companyId, @bankName, @bankAccount, @bankBik, @inn, @kpp)
        `, {
          id: nextId,
          companyId,
          bankName: bankData.bankName.trim(),
          bankAccount: bankData.bankAccount.trim(),
          bankBik: bankData.bankBik.trim(),
          inn: bankData.inn.trim(),
          kpp: bankData.kpp?.trim() || null
        });
      }
    }
  } catch (error) {
    console.error('Ошибка при обновлении банковского счета:', error);
    throw error;
  }
}
