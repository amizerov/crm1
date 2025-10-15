import Link from 'next/link';
import CompanySelector from './CompanySelector';

interface ListPageLayoutProps {
  title: string;
  companies: any[];
  selectedCompanyId: number;
  onCompanyChange: (companyId: number) => void;
  isPending?: boolean;
  addButtonText: string;
  addButtonHref: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function ListPageLayout({
  title,
  companies,
  selectedCompanyId,
  onCompanyChange,
  isPending = false,
  addButtonText,
  addButtonHref,
  children,
  footer
}: ListPageLayoutProps) {
  return (
    <div className="py-5">
      {/* Шапка с заголовком, селектором компании и кнопкой */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 m-0">
            {title}
          </h1>
          
          <CompanySelector
            companies={companies}
            selectedCompanyId={selectedCompanyId}
            onCompanyChange={onCompanyChange}
            isPending={isPending}
            storageKey="selectedCompanyId"
          />
        </div>
        
        <div className="flex items-center gap-4 flex-wrap">
          <Link href={addButtonHref}>
            <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white border-none rounded cursor-pointer transition-colors">
              {addButtonText}
            </button>
          </Link>
        </div>
      </div>

      {/* Основной контент */}
      {children}
      
      {/* Футер с информацией */}
      {footer && (
        <div className="flex gap-4 mt-5 justify-start flex-wrap">
          {footer}
        </div>
      )}
    </div>
  );
}