import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import { addProject, getCompanies } from '../actions';
import Link from 'next/link';

export default async function AddProjectPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const companies = await getCompanies();

  return (
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Link href="/projects">
            <button style={{ 
              padding: '8px 16px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer' 
            }}>
              ← Назад к списку
            </button>
          </Link>
          <h1 style={{ margin: 0 }}>Добавить проект</h1>
        </div>
      </div>

      <form action={addProject} style={{ 
        backgroundColor: '#f8f9fa', 
        padding: 32, 
        borderRadius: 8, 
        border: '1px solid #dee2e6' 
      }}>
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="projectName" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Название проекта *
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
            placeholder="Введите название проекта"
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label htmlFor="description" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder="Введите описание проекта"
          />
        </div>

        <div style={{ marginBottom: 32 }}>
          <label htmlFor="companyId" style={{ 
            display: 'block', 
            marginBottom: 8, 
            fontWeight: 'bold',
            color: '#333'
          }}>
            Компания *
          </label>
          <select
            id="companyId"
            name="companyId"
            required
            defaultValue={currentUser.companyId || ''}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          >
            <option value="">Выберите компанию</option>
            {companies.map((company: { id: number; companyName: string }) => (
              <option key={company.id} value={company.id}>
                {company.companyName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: 16, 
          justifyContent: 'flex-end' 
        }}>
          <Link href="/projects">
            <button type="button" style={{ 
              padding: '12px 24px', 
              backgroundColor: '#6c757d', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer' 
            }}>
              Отмена
            </button>
          </Link>
          <button type="submit" style={{ 
            padding: '12px 24px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer' 
          }}>
            Сохранить
          </button>
        </div>
      </form>
    </div>
  );
}
