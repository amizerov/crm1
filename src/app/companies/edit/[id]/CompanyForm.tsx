'use client';

import { useState } from 'react';
import { deleteCompany, updateCompany } from './actions';
import { CompanyFormProps} from "../../types";
import FormContainer from '@/components/FormContainer';
import FormFieldStandard from '@/components/FormFieldStandard';
import ButtonSave from '@/components/ButtonSave';
import ButtonCancel from '@/components/ButtonCancel';
import ButtonDelete from '@/components/ButtonDelete';
import { COMPONENT_STYLES } from '@/styles/constants';

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
      <div style={{ 
        borderBottom: '1px solid #dee2e6', 
        marginBottom: 24 
      }}>
        <div style={{ display: 'flex', gap: 0 }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 24px',
                color: activeTab === tab.id ? '#007bff' : '#6c757d',
                fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                backgroundColor: 'transparent',
                fontSize: 16,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <FormContainer
        action={updateCompany}
        buttons={
          <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', width: '100%' }}>
            <ButtonDelete
              confirmTitle="Удалить компанию"
              confirmMessage={`Вы уверены, что хотите удалить компанию ${company.companyName}?`}
              deleteAction={deleteCompany.bind(null, company.id)}
              redirectTo="/companies"
            />
            <div style={{ display: 'flex', gap: 16 }}>
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
          <div style={{ display: activeTab === 0 ? 'block' : 'none' }}>
            {/* ИНН и Название компании */}
            <div style={{ display: 'flex', gap: 16 }}>
              <FormFieldStandard label="ИНН" style={{ flex: 1 }}>
                <input
                  type="text"
                  name="inn"
                  defaultValue={company.inn || ''}
                  placeholder="1234567890"
                  style={{ ...COMPONENT_STYLES.input, fontFamily: 'monospace' }}
                />
              </FormFieldStandard>
              
              <FormFieldStandard label="Название компании" required style={{ flex: 2 }}>
                <input
                  type="text"
                  name="companyName"
                  required
                  defaultValue={company.companyName}
                  style={COMPONENT_STYLES.input}
                />
              </FormFieldStandard>
            </div>

            {/* КПП и ОГРН */}
            <div style={{ display: 'flex', gap: 16 }}>
              <FormFieldStandard label="КПП" style={{ flex: 1 }}>
                <input
                  type="text"
                  name="kpp"
                  defaultValue={company.kpp || ''}
                  placeholder="123456789"
                  style={COMPONENT_STYLES.input}
                />
              </FormFieldStandard>
              
              <FormFieldStandard label="ОГРН" style={{ flex: 1 }}>
                <input
                  type="text"
                  name="ogrn"
                  defaultValue={company.ogrn || ''}
                  placeholder="1234567890123"
                  style={COMPONENT_STYLES.input}
                />
              </FormFieldStandard>
            </div>

            {/* Директор */}
            <FormFieldStandard label="Директор">
              <input
                type="text"
                name="director"
                defaultValue={company.director || ''}
                placeholder="Фамилия Имя Отчество"
                style={COMPONENT_STYLES.input}
              />
            </FormFieldStandard>

            {/* Адрес */}
            <FormFieldStandard label="Адрес">
              <input
                type="text"
                name="address"
                defaultValue={company.address || ''}
                style={COMPONENT_STYLES.input}
              />
            </FormFieldStandard>
          </div>

          {/* Вкладка 1: Контакты */}
          <div style={{ display: activeTab === 1 ? 'block' : 'none' }}>
            {/* Телефон и Email в одну строку */}
            <div style={{ display: 'flex', gap: 16 }}>
              <FormFieldStandard label="Телефон" style={{ flex: 1 }}>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={company.phone || ''}
                  style={COMPONENT_STYLES.input}
                />
              </FormFieldStandard>
              
              <FormFieldStandard label="Email" style={{ flex: 1 }}>
                <input
                  type="email"
                  name="email"
                  defaultValue={company.email || ''}
                  style={COMPONENT_STYLES.input}
                />
              </FormFieldStandard>
            </div>

            {/* Веб-сайт */}
            <FormFieldStandard label="Веб-сайт">
              <input
                type="url"
                name="website"
                defaultValue={company.website || ''}
                placeholder="https://example.com"
                style={COMPONENT_STYLES.input}
              />
            </FormFieldStandard>

            {/* Комментарий */}
            <FormFieldStandard label="Комментарий">
              <textarea
                name="comment"
                defaultValue={company.description || ''}
                rows={6}
                placeholder="Дополнительная информация о компании..."
                style={{
                  ...COMPONENT_STYLES.input,
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </FormFieldStandard>
          </div>

          {/* Вкладка 2: Реквизиты */}
          <div style={{ display: activeTab === 2 ? 'block' : 'none' }}>
            {/* БИК и Название банка */}
            <div style={{ display: 'flex', gap: 16 }}>
              <FormFieldStandard label="БИК" style={{ flex: 1 }}>
                <input
                  type="text"
                  name="bankBik"
                  defaultValue={''}
                  placeholder="044525225"
                  style={COMPONENT_STYLES.input}
                />
              </FormFieldStandard>
              
              <FormFieldStandard label="Название банка" style={{ flex: 2 }}>
                <input
                  type="text"
                  name="bankName"
                  defaultValue={''}
                  style={COMPONENT_STYLES.input}
                />
              </FormFieldStandard>
            </div>

            {/* Расчетный счет */}
            <FormFieldStandard label="Расчетный счет" isLast>
              <input
                type="text"
                name="bankAccount"
                defaultValue={''}
                placeholder="40702810000000000000"
                style={COMPONENT_STYLES.input}
              />
            </FormFieldStandard>
          </div>
        </div>
      </FormContainer>
    </>
  );
}