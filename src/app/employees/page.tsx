import { getEmployees, Employee } from './actions';
import { getCurrentUser } from '@/db/loginUser';
import { redirect } from 'next/navigation';
import EmployeeRow from './EmployeeRow';
import Link from 'next/link';

export default async function EmployeesPage() {
  // Проверяем авторизацию
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/login');
  }

  const employees = await getEmployees();

  return (
    <div style={{ padding: '20px 0' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 32, 
        flexWrap: 'wrap', 
        gap: 16 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>Сотрудники</h1>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '8px 16px', 
            borderRadius: 6, 
            border: '1px solid #dee2e6' 
          }}>
            <span style={{ fontSize: 14, color: '#6c757d', fontWeight: 'bold' }}>
              Всего сотрудников: {employees.length}
            </span>
          </div>
          <div style={{ 
            backgroundColor: '#e7f3ff', 
            padding: '6px 12px', 
            borderRadius: 4, 
            border: '1px solid #b3d9ff' 
          }}>
            <span style={{ fontSize: 12, color: '#0056b3', fontStyle: 'italic' }}>
              💡 Нажмите на строку для редактирования
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href="/employees/add">
            <button style={{ 
              padding: '12px 24px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer' 
            }}>
              + Добавить сотрудника
            </button>
          </Link>
        </div>
      </div>

      {/* Таблица сотрудников */}
      {employees.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <p>Сотрудники не найдены</p>
          <Link href="/employees/add">
            <button style={{ 
              padding: '10px 20px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer', 
              marginTop: 16 
            }}>
              Добавить первого сотрудника
            </button>
          </Link>
        </div>
      ) : (
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          border: '1px solid #ddd'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
              <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Имя</th>
              <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Пользователь</th>
              <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Компания</th>
              <th style={{ padding: 12, border: '1px solid #ddd', textAlign: 'left' }}>Дата создания</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee: Employee) => (
              <EmployeeRow 
                key={employee.id} 
                employee={employee} 
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
