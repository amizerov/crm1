'use client';

import { useState } from 'react';
import { updateCompany } from './actions';
import FormField from '@/components/FormField';
import { CompanyFormProps} from "../../types";
import DeleteButton from './DelBtn';
import { ButtonSave } from '@/components/Buttons';

export default function CompanyForm({ company }: CompanyFormProps) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, label: 'Профиль' },
    { id: 1, label: 'Контакты' },
    { id: 2, label: 'Реквизиты' }
  ];

  return (
    <div className="
      bg-white dark:!bg-gray-800 
      p-8 
      rounded-xl 
      border border-gray-200 dark:border-gray-700 
      shadow-lg dark:shadow-gray-900/20
    ">
      {/* Табы */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-3
                border-b-2
                ${activeTab === tab.id 
                  ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'border-transparent text-gray-600 dark:text-gray-400 font-normal hover:text-gray-900 dark:hover:text-gray-200'
                }
                bg-transparent
                text-base
                cursor-pointer
                transition-all duration-200
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <form action={updateCompany}>
        <input type="hidden" name="companyId" value={company.id} />
        
        {/* Контент табов с фиксированной высотой */}
        <div className="min-h-[400px] flex flex-col">

          {/* Вкладка 0: Профиль */}
          <div className={`flex-1 ${activeTab === 0 ? 'block' : 'hidden'}`}>
            {/* ИНН и Название компании */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <FormField label="ИНН" htmlFor="inn">
                  <input
                    type="text"
                    id="inn"
                    name="inn"
                    defaultValue={company.inn || ''}
                    placeholder="1234567890"
                  />
                </FormField>
              </div>
              <div className="flex-[2]">
                <FormField label="Название компании" htmlFor="companyName" required>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    defaultValue={company.companyName}
                    required
                  />
                </FormField>
              </div>
            </div>

            {/* КПП и ОГРН */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <FormField label="КПП" htmlFor="kpp">
                  <input
                    type="text"
                    id="kpp"
                    name="kpp"
                    defaultValue={company.kpp || ''}
                    placeholder="123456789"
                  />
                </FormField>
              </div>
              <div className="flex-1">
                <FormField label="ОГРН" htmlFor="ogrn">
                  <input
                    type="text"
                    id="ogrn"
                    name="ogrn"
                    defaultValue={company.ogrn || ''}
                    placeholder="1234567890123"
                  />
                </FormField>
              </div>
            </div>

            {/* Директор */}
            <div className="mb-6">
              <FormField label="Директор" htmlFor="director">
                <input
                  type="text"
                  id="director"
                  name="director"
                  defaultValue={company.director || ''}
                  placeholder="Фамилия Имя Отчество"
                />
              </FormField>
            </div>

            {/* Адрес */}
            <div className="mb-6">
              <FormField label="Адрес" htmlFor="address">
                <input
                  type="text"
                  id="address"
                  name="address"
                  defaultValue={company.address || ''}
                />
              </FormField>
            </div>
          </div>

          {/* Вкладка 1: Контакты */}
          <div className={`flex-1 ${activeTab === 1 ? 'block' : 'hidden'}`}>
            {/* Телефон и Email в одну строку */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <FormField label="Телефон" htmlFor="phone">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    defaultValue={company.phone || ''}
                  />
                </FormField>
              </div>
              <div className="flex-1">
                <FormField label="Email" htmlFor="email">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    defaultValue={company.email || ''}
                  />
                </FormField>                
              </div>
            </div>

            {/* Веб-сайт */}
            <div className="mb-6">
              <FormField label="Веб-сайт" htmlFor="website">
                <input
                  type="url"
                  id="website"
                  name="website"
                  defaultValue={company.website || ''}
                  placeholder="https://example.com"
                />
              </FormField>
            </div>

            {/* Комментарий */}
            <div className="mb-6">
              <FormField label="Комментарий" htmlFor="comment">
                <textarea
                  id="comment"
                  name="comment"
                  defaultValue={company.description || ''}
                  rows={6}
                  placeholder="Дополнительная информация о компании..."
                  className="resize-y"
                />
              </FormField>
            </div>
          </div>

          {/* Вкладка 2: Реквизиты */}
          <div className={`flex-1 ${activeTab === 2 ? 'block' : 'hidden'}`}>
            {/* БИК и Название банка */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <FormField label="БИК" htmlFor="bankBik">
                  <input
                    type="text"
                    id="bankBik"
                    name="bankBik"
                    defaultValue={''}
                    placeholder="044525225"
                  />
                </FormField>
              </div>
              <div className="flex-[2]">
                <FormField label="Название банка" htmlFor="bankName">
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    defaultValue={''}
                  />
                </FormField>
              </div>
            </div>

            {/* Расчетный счет */}
            <div className="mb-6">
              <FormField label="Расчетный счет" htmlFor="bankAccount">
                <input
                  type="text"
                  id="bankAccount"
                  name="bankAccount"
                  defaultValue={''}
                  placeholder="40702810000000000000"
                />
              </FormField>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="
          flex gap-3 justify-between 
          pt-6 
          border-t border-gray-200 dark:border-gray-700
        ">
          <div>
            <DeleteButton 
              companyName={company.companyName}
              companyId={company.id}
            />
          </div>
          
          <div className="flex gap-3">
            <a
              href="/companies"
              className="
                inline-block
                px-6 py-3
                border border-gray-300 dark:border-gray-600
                rounded-md
                bg-white dark:bg-gray-700
                text-gray-700 dark:text-gray-300
                text-base
                no-underline
                text-center
                hover:bg-gray-50 dark:hover:bg-gray-600
                transition-colors duration-200
              "
            >
              Отмена
            </a>
            <ButtonSave type="submit" />
          </div>
        </div>
      </form>
    </div>
  );
}