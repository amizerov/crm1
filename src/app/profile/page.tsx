import { getCurrentUser } from '@/app/(auth)/actions/login';
import { getUserCompanies } from '@/db/getUsers';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {

  // Получаем текущего пользователя
  const currentUser = await getCurrentUser();
  
  // Загружаем компании пользователя
  const companies = await getUserCompanies(currentUser.id);

  return (
    <div style={{ padding: '20px 0', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: '0 0 12px 0', fontSize: '28px', color: '#333' }}>
          Редактирование профиля
        </h1>
      </div>

      <ProfileForm user={currentUser} companies={companies} />
    </div>
  );
}
