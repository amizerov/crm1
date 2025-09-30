'use client';

interface UserCompany {
  id: number;
  companyName: string;
  isOwner: boolean;
}

interface CompanySelectorProps {
  userCompanies: UserCompany[];
  companyId: number | undefined;
}

export default function CompanySelector({ userCompanies, companyId }: CompanySelectorProps) {
  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCompanyId = e.target.value;
    const url = new URL(window.location.href);
    if (newCompanyId) {
      url.searchParams.set('company', newCompanyId);
    } else {
      url.searchParams.delete('company');
    }
    window.location.href = url.toString();
  };

  return (
    <select
      value={companyId || ''}
      onChange={handleCompanyChange}
      className="
        px-3 py-2 border border-gray-300 dark:border-gray-600 
        rounded-md text-lg bg-white dark:bg-gray-700 
        text-gray-900 dark:text-gray-100
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        min-w-[250px] font-medium
      "
    >
      <option value="">Все доступные компании</option>
      {userCompanies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.companyName} {company.isOwner ? '👑' : '👤'}
        </option>
      ))}
    </select>
  );
}
