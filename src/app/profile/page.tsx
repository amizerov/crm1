import { getCurrentUser } from '@/app/(auth)/actions/login';
import { getUserCompanies } from '@/db/getUsers';
import ProfileForm from './ProfileForm';
import FormPageLayout from '@/components/FormPageLayout';
import ButtonBack from '@/components/ButtonBack';

export default async function ProfilePage() {

  // Получаем текущего пользователя
  const currentUser = await getCurrentUser();
  // Если пользователь не авторизован - возвращаем ошибку
  if (!currentUser) {
    return { success: false, error: 'Требуется авторизация' };
  }

  // Загружаем компании пользователя
  const companies = await getUserCompanies(currentUser.id);

  return (
    <FormPageLayout 
      title="Редактирование профиля"
      subtitle="Обновите информацию о вашем профиле"
      actionButton={<ButtonBack />}
    >
      <ProfileForm user={currentUser} companies={companies} />
    </FormPageLayout>
  );
}
