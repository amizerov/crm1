'use client';

import { useState } from 'react';
import { deleteCompany, updateCompany } from './actions';
import { CompanyFormProps} from "../../types";
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import { StandardInput, StandardTextarea } from '@/components/StandardInputs';
import ButtonSave from '@/components/ButtonSave';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonDelete from '@/components/ButtonDelete';

export default function CompanyForm({ company }: CompanyFormProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, label: 'Профиль' },
    { id: 1, label: 'Контакты' },
    { id: 2, label: 'Реквизиты' }
  ];

  return (
    <>
      {/* Табы */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3 text-base font-medium transition-all duration-200 border-none cursor-pointer
                border-b-2 bg-transparent
                ${activeTab === tab.id 
                  ? 'text-blue-600 dark:text-blue-400 font-bold border-b-blue-600 dark:border-b-blue-400' 
                  : 'text-gray-600 dark:text-gray-400 font-normal border-b-transparent hover:text-gray-800 dark:hover:text-gray-200'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <FormContainer
        action={updateCompany}
        buttons={
          <div className="flex justify-between items-center w-full gap-4">
            <ButtonDelete
              confirmTitle="Удалить компанию"
              confirmMessage={`Вы уверены, что хотите удалить компанию ${company.companyName}?`}
              deleteAction={deleteCompany.bind(null, company.id)}
              redirectTo="/companies"
            />
            <div className="flex gap-4">
              <ButtonCancel />
              <ButtonSave />
            </div>
          </div>
        }
      >
        <input type="hidden" name="companyId" value={company.id} />
        
        {/* Контент табов с фиксированной высотой */}
        <div className="min-h-[400px] flex flex-col">

          {/* Вкладка 0: Профиль */}
          <div className={activeTab === 0 ? 'block' : 'hidden'}>
            {/* ИНН и Название компании */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormFieldStandard label="ИНН">
                <StandardInput
                  type="text"
                  name="inn"
                  defaultValue={company.inn || ''}
                  placeholder="1234567890"
                  className="font-mono"
                />
              </FormFieldStandard>
              
              <FormFieldStandard label="Название компании" required className="md:col-span-2">
                <StandardInput
                  type="text"
                  name="companyName"
                  required
                  defaultValue={company.companyName}
                />
              </FormFieldStandard>
            </div>

            {/* КПП и ОГРН */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldStandard label="КПП">
                <StandardInput
                  type="text"
                  name="kpp"
                  defaultValue={company.kpp || ''}
                  placeholder="123456789"
                />
              </FormFieldStandard>
              
              <FormFieldStandard label="ОГРН">
                <StandardInput
                  type="text"
                  name="ogrn"
                  defaultValue={company.ogrn || ''}
                  placeholder="1234567890123"
                />
              </FormFieldStandard>
            </div>

            {/* Директор */}
            <FormFieldStandard label="Директор">
              <StandardInput
                type="text"
                name="director"
                defaultValue={company.director || ''}
                placeholder="Фамилия Имя Отчество"
              />
            </FormFieldStandard>

            {/* Адрес */}
            <FormFieldStandard label="Адрес">
              <StandardInput
                type="text"
                name="address"
                defaultValue={company.address || ''}
              />
            </FormFieldStandard>
          </div>

          {/* Вкладка 1: Контакты */}
          <div className={activeTab === 1 ? 'block' : 'hidden'}>
            {/* Телефон и Email в одну строку */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormFieldStandard label="Телефон">
                <StandardInput
                  type="tel"
                  name="phone"
                  defaultValue={company.phone || ''}
                />
              </FormFieldStandard>
              
              <FormFieldStandard label="Email">
                <StandardInput
                  type="email"
                  name="email"
                  defaultValue={company.email || ''}
                />
              </FormFieldStandard>
            </div>

            {/* Веб-сайт */}
            <FormFieldStandard label="Веб-сайт">
              <StandardInput
                type="url"
                name="website"
                defaultValue={company.website || ''}
                placeholder="https://example.com"
              />
            </FormFieldStandard>

            {/* Комментарий */}
            <FormFieldStandard label="Комментарий">
              <StandardTextarea
                name="comment"
                defaultValue={company.description || ''}
                rows={6}
                placeholder="Дополнительная информация о компании..."
              />
            </FormFieldStandard>
          </div>

          {/* Вкладка 2: Реквизиты */}
          <div className={activeTab === 2 ? 'block' : 'hidden'}>
            {/* БИК и Название банка */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormFieldStandard label="БИК">
                <StandardInput
                  type="text"
                  name="bankBik"
                  defaultValue={''}
                  placeholder="044525225"
                />
              </FormFieldStandard>
              
              <FormFieldStandard label="Название банка" className="md:col-span-2">
                <StandardInput
                  type="text"
                  name="bankName"
                  defaultValue={''}
                />
              </FormFieldStandard>
            </div>

            {/* Расчетный счет */}
            <FormFieldStandard label="Расчетный счет" isLast>
              <StandardInput
                type="text"
                name="bankAccount"
                defaultValue={''}
                placeholder="40702810000000000000"
              />
            </FormFieldStandard>
          </div>
        </div>
      </FormContainer>
    </>
  );
}