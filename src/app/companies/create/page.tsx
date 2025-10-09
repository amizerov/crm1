import { getCurrentUser } from '@/app/(auth)/actions/login';
import { redirect } from 'next/navigation';
import { query } from '@/db/connect';
import { revalidatePath } from 'next/cache';

async function createCompany(formData: FormData) {
  'use server';
  
  try {
    // Проверяем авторизацию
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      redirect('/login');
    }

    let companyName = formData.get('companyName') as string;
    const inn = formData.get('inn') as string;

    // Проверяем, что заполнено хотя бы одно из полей
    if (!companyName?.trim() && !inn?.trim()) {
      throw new Error('Необходимо заполнить либо название компании, либо ИНН');
    }

    // Инициализируем переменные для данных компании
    let kpp = '';
    let ogrn = '';
    let address = '';
    let phone = '';
    let director = '';

    // Если указан ИНН, получаем данные из API
    if (inn?.trim()) {
      try {
        console.log('Получение данных по ИНН:', inn.trim());
        
        const apiResponse = await fetch(`https://crm.argoai.ru/api/company/${inn.trim()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          console.log('Получены данные из API:', apiData);

          if (apiData.ЮЛ) {
            const companyData = apiData.ЮЛ;
            
            // Если название не указано пользователем, берем из API
            if (!companyName?.trim()) {
              companyName = companyData.НаимСокрЮЛ || companyData.НаимПолнЮЛ || '';
            }
            
            // Заполняем остальные поля из API
            kpp = companyData.КПП || '';
            ogrn = companyData.ОГРН || '';
            address = companyData.Адрес?.АдресПолн || '';
            director = companyData.Руководитель?.ФИОПолн || '';
            
            // Берем первый телефон из массива
            if (companyData.Контакты?.Телефон && companyData.Контакты.Телефон.length > 0) {
              phone = companyData.Контакты.Телефон[0];
            }

            console.log('Обработанные данные:', {
              companyName, inn: inn.trim(), kpp, ogrn, address, phone, director
            });
          }
        } else {
          console.log('API не вернул данные, статус:', apiResponse.status);
        }
      } catch (apiError) {
        console.error('Ошибка при запросе к API:', apiError);
        // Продолжаем создание компании даже если API недоступен
      }
    }

    // Проверяем уникальность названия компании (если указано)
    if (companyName?.trim()) {
      const existingCompany = await query(
        'SELECT id FROM Company WHERE companyName = @companyName',
        { companyName: companyName.trim() }
      );

      if (existingCompany.length > 0) {
        throw new Error('Компания с таким названием уже существует');
      }
    }

    // Проверяем уникальность ИНН (если указан)
    if (inn?.trim()) {
      const existingInn = await query(
        'SELECT id FROM Company WHERE inn = @inn',
        { inn: inn.trim() }
      );

      if (existingInn.length > 0) {
        throw new Error('Компания с таким ИНН уже существует');
      }
    }

    // Создаем новую компанию с данными из API (если получены)
    const result = await query(`
      INSERT INTO Company (companyName, inn, kpp, ogrn, address, phone, director, ownerId)
      OUTPUT INSERTED.id
      VALUES (@companyName, @inn, @kpp, @ogrn, @address, @phone, @director, @ownerId)
    `, {
      companyName: companyName?.trim() || null,
      inn: inn?.trim() || null,
      kpp: kpp || null,
      ogrn: ogrn || null,
      address: address || null,
      phone: phone || null,
      director: director || null,
      ownerId: currentUser.id
    });

    const newCompanyId = result[0].id;

    // Делаем новую компанию активной для пользователя
    await query(`
      UPDATE [User] SET companyId = @companyId WHERE id = @userId
    `, {
      companyId: newCompanyId,
      userId: currentUser.id
    });
    await query(`
      IF NOT EXISTS (SELECT 1 FROM User_Company WHERE userId = @userId AND companyId = @companyId)
      BEGIN
        INSERT INTO User_Company (userId, companyId) VALUES (@userId, @companyId)
      END
    `, {
      userId: currentUser.id,
      companyId: newCompanyId
    });

    // Обновляем кеш
    revalidatePath('/companies');
    revalidatePath('/profile');
    revalidatePath('/');

  } catch (error) {
    console.error('Ошибка при создании компании:', error);
    throw error;
  }

  // Перенаправляем на страницу компаний
  redirect('/companies');}

export default async function CreateCompanyPage() {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', color: '#333' }}>
          Создать новую компанию
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Укажите название компании или ИНН. Одно из полей обязательно для заполнения.
        </p>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        padding: '32px',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <form action={createCompany}>
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="companyName" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#495057',
              fontSize: '14px'
            }}>
              Название компании
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              placeholder="ООО Рога и копыта"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label htmlFor="inn" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#495057',
              fontSize: '14px'
            }}>
              ИНН
            </label>
            <input
              type="text"
              id="inn"
              name="inn"
              placeholder="1234567890"
              maxLength={12}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '16px',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
            />
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              marginTop: '4px'
            }}>
              * Необходимо заполнить либо название компании, либо ИНН
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <a
              href="/companies"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                border: '1px solid #6c757d',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#6c757d',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                textAlign: 'center'
              }}
            >
              Отмена
            </a>
            <button
              type="submit"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#007bff',
                color: 'white',
                fontSize: '16px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Создать компанию
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
