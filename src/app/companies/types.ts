// Основной тип компании
export type Company = {
  id: number;
  companyName: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  ownerId: number;
  ownerName?: string;
  director?: string;
  inn?: string;
  kpp?: string;
  ogrn?: string;
};

// Тип для формы компании
export type CompanyFormData = Omit<Company, 'id' | 'ownerName'>;

// Props для компонента формы
export type CompanyFormProps = {
  company: Company;
};

// Props для списка компаний
export type CompanyListProps = {
  companies: Company[];
};

// Тип для создания новой компании
export type CreateCompanyData = {
  companyName: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  ownerId: number;
  bankName?: string;
  bankAccount?: string;
  bankBik?: string;
  inn?: string;
  kpp?: string;
};

// Тип для обновления компании
export type UpdateCompanyData = Partial<CreateCompanyData> & {
  id: number;
};