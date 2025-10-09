'use server';

import { query } from '@/db/connect';
import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function updateCompany(formData: FormData) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    const companyId = parseInt(formData.get('companyId') as string);
    
    if (isNaN(companyId)) {
      throw new Error('Неверный ID компании');
    }

    // Проверяем, что пользователь является владельцем этой компании
    const companyOwnerCheck = await query(
      'SELECT ownerId FROM Company WHERE id = @companyId',
      { companyId }
    );

    if (companyOwnerCheck.length === 0) {
      throw new Error('Компания не найдена');
    }

    if (companyOwnerCheck[0].ownerId !== currentUser.id) {
      throw new Error('Нет прав для редактирования этой компании');
    }
    const companyName = formData.get('companyName') as string;
    const address = (formData.get('address') as string) || '';
    const phone = (formData.get('phone') as string) || '';
    const email = (formData.get('email') as string) || '';
    const website = (formData.get('website') as string) || '';
    const comment = (formData.get('comment') as string) || '';
    
    const inn = (formData.get('inn') as string) || '';
    const kpp = (formData.get('kpp') as string) || '';
    const ogrn = (formData.get('ogrn') as string) || '';
    const director = (formData.get('director') as string) || '';

    // Валидация
    if (!companyName.trim()) {
      throw new Error('Название компании обязательно для заполнения');
    }

    // Проверяем уникальность названия компании (исключая текущую компанию)
    const existingCompany = await query(
      'SELECT id FROM Company WHERE companyName = @companyName AND id != @companyId',
      { companyName: companyName.trim(), companyId }
    );

    if (existingCompany.length > 0) {
      throw new Error('Компания с таким названием уже существует');
    }

    // Обновляем основную информацию компании
    await query(`
      UPDATE Company SET 
        companyName = @companyName,
        inn = @inn,
        kpp = @kpp,
        ogrn = @ogrn,
        director = @director,
        address = @address,
        phone = @phone,
        email = @email,
        website = @website,
        description = @comment
      WHERE id = @companyId
    `, {
      companyId,
      companyName: companyName.trim(),
      inn: inn.trim() || null,
      kpp: kpp.trim() || null,
      ogrn: ogrn.trim() || null,
      director: director.trim() || null,
      address: address.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      website: website.trim() || null,
      comment: comment.trim() || null
    });

    // Обновляем кеш
    revalidatePath('/companies');
    revalidatePath(`/companies/edit/${companyId}`);
    revalidatePath('/profile');
    revalidatePath('/');

    // Перенаправляем на список компаний
    redirect('/companies');
  } catch (error) {
    console.error('Ошибка при обновлении компании:', error);
    throw error;
  }
}

export async function deleteCompany(companyId: number) {
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    if (isNaN(companyId)) {
      throw new Error('Неверный ID компании');
    }

    // Проверяем, что пользователь является владельцем этой компании
    const companyOwnerCheck = await query(
      'SELECT ownerId, companyName FROM Company WHERE id = @companyId',
      { companyId }
    );

    if (companyOwnerCheck.length === 0) {
      throw new Error('Компания не найдена');
    }

    if (companyOwnerCheck[0].ownerId !== currentUser.id) {
      throw new Error('Нет прав для удаления этой компании');
    }

    const companyName = companyOwnerCheck[0].companyName;

    // Удаляем компанию
    await query('DELETE FROM Company WHERE id = @companyId', { companyId });

    console.log(`Компания "${companyName}" (ID: ${companyId}) удалена пользователем ${currentUser.id}`);

    // Обновляем кеш
    revalidatePath('/companies');
    revalidatePath('/profile');
    revalidatePath('/');

  } catch (error) {
    console.error('Ошибка при удалении компании:', error);
    throw error;
  }
}

export async function getCompanyById(companyId: number) {
  try {
    const companies = await query(`
      SELECT 
        c.id, 
        c.companyName,
        c.description,
        c.address,
        c.phone,
        c.email,
        c.website,
        c.ownerId,
        c.director,
        u.nicName as ownerName,
        c.inn,
        c.kpp,
        c.ogrn
      FROM Company c
      LEFT JOIN [User] u ON c.ownerId = u.id
      WHERE c.id = @companyId
    `, { companyId });
    
    return companies.length > 0 ? companies[0] : null;
  } catch (error) {
    console.error('Ошибка при получении данных компании:', error);
    return null;
  }
}