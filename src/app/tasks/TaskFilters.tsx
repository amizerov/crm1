'use client';

import { useState, useRef, useEffect } from 'react';

export type FilterType = 'all' | 'important' | 'forgotten' | 'overdue' | 'my' | 'unassigned' | 'completed';

interface TaskFiltersProps {
  onFilterChange: (filter: FilterType) => void;
  currentFilter: FilterType;
  tasksCount: {
    all: number;
    important: number;
    forgotten: number;
    overdue: number;
    my: number;
    unassigned: number;
    completed: number;
  };
}

export default function TaskFilters({ onFilterChange, currentFilter, tasksCount }: TaskFiltersProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState<FilterType[]>([]);
  const [hiddenFilters, setHiddenFilters] = useState<FilterType[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const filters = [
    { key: 'all' as FilterType, label: 'Все задачи', count: tasksCount.all, color: '#6c757d' },
    { key: 'important' as FilterType, label: '🔥 Важные', count: tasksCount.important, color: '#dc3545' },
    { key: 'forgotten' as FilterType, label: '⏰ Забытые', count: tasksCount.forgotten, color: '#fd7e14' },
    { key: 'overdue' as FilterType, label: '⚡ Просроченные', count: tasksCount.overdue, color: '#e83e8c' },
    { key: 'completed' as FilterType, label: '✅ Выполненные', count: tasksCount.completed, color: '#28a745' },
    { key: 'my' as FilterType, label: '👤 Мои задачи', count: tasksCount.my, color: '#20c997' },
    { key: 'unassigned' as FilterType, label: '❓ Без исполнителя', count: tasksCount.unassigned, color: '#6f42c1' },
  ];

  // Функция для вычисления видимых и скрытых фильтров
  const calculateVisibleFilters = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    
    // Примерная ширина элементов (кнопка фильтра ~120px, текст "Фильтры:" ~80px, кнопка меню ~40px)
    const labelWidth = 80;
    const menuButtonWidth = 40;
    const filterButtonWidth = 120;
    const spacing = 12;
    
    // Доступная ширина для кнопок фильтров
    const availableWidth = containerWidth - labelWidth - menuButtonWidth - spacing * 3;
    
    // Количество фильтров, которые помещаются
    const maxVisibleFilters = Math.floor(availableWidth / (filterButtonWidth + spacing));
    
    if (maxVisibleFilters >= filters.length) {
      // Все фильтры помещаются
      setVisibleFilters(filters.map(f => f.key));
      setHiddenFilters([]);
    } else if (maxVisibleFilters > 0) {
      // Часть фильтров помещается
      setVisibleFilters(filters.slice(0, maxVisibleFilters).map(f => f.key));
      setHiddenFilters(filters.slice(maxVisibleFilters).map(f => f.key));
    } else {
      // Очень узкий экран - показываем только текущий активный фильтр
      setVisibleFilters([currentFilter]);
      setHiddenFilters(filters.filter(f => f.key !== currentFilter).map(f => f.key));
    }
  };

  useEffect(() => {
    calculateVisibleFilters();
    
    const handleResize = () => {
      calculateVisibleFilters();
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    document.addEventListener('mousedown', handleClickOutside);
    
    // Небольшая задержка для корректного вычисления размеров после рендера
    const timeout = setTimeout(calculateVisibleFilters, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
      clearTimeout(timeout);
    };
  }, [containerRef.current, tasksCount]);

  const getFilterInfo = (filterKey: FilterType) => {
    return filters.find(f => f.key === filterKey);
  };

  const handleFilterClick = (filterKey: FilterType) => {
    onFilterChange(filterKey);
    setIsDropdownOpen(false);
  };

  return (
    <div ref={containerRef} style={{ 
      display: 'flex', 
      gap: 12, 
      alignItems: 'center',
      padding: '16px 0 8px 0',
      marginBottom: 8,
      position: 'relative'
    }}>
      <span style={{ 
        fontSize: 14, 
        fontWeight: 'bold', 
        color: '#495057',
        marginRight: 8,
        flexShrink: 0
      }}>
        Фильтры:
      </span>
      
      {/* Видимые фильтры */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'nowrap', overflow: 'hidden' }}>
        {visibleFilters.map((filterKey) => {
          const filter = getFilterInfo(filterKey);
          if (!filter) return null;
          
          return (
            <button
              key={filter.key}
              onClick={() => handleFilterClick(filter.key)}
              style={{
                padding: '8px 16px',
                border: currentFilter === filter.key ? `2px solid ${filter.color}` : '1px solid #dee2e6',
                borderRadius: 20,
                backgroundColor: currentFilter === filter.key ? `${filter.color}15` : '#fff',
                color: currentFilter === filter.key ? filter.color : '#495057',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: currentFilter === filter.key ? 'bold' : 'normal',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                if (currentFilter !== filter.key) {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.borderColor = filter.color;
                }
              }}
              onMouseLeave={(e) => {
                if (currentFilter !== filter.key) {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.borderColor = '#dee2e6';
                }
              }}
            >
              <span>{filter.label}</span>
              {filter.count > 0 && (
                <span style={{
                  backgroundColor: currentFilter === filter.key ? filter.color : '#6c757d',
                  color: 'white',
                  borderRadius: 10,
                  padding: '2px 6px',
                  fontSize: 11,
                  fontWeight: 'bold',
                  minWidth: 18,
                  textAlign: 'center'
                }}>
                  {filter.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Кнопка выпадающего меню (если есть скрытые фильтры) */}
      {hiddenFilters.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            style={{
              width: 36,
              height: 36,
              border: '1px solid #dee2e6',
              borderRadius: 20,
              backgroundColor: '#fff',
              color: '#495057',
              cursor: 'pointer',
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              flexShrink: 0
            }}
            title="Больше фильтров"
          >
            ⋮
          </button>

          {/* Выпадающее меню */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 1000,
              backgroundColor: '#fff',
              border: '1px solid #dee2e6',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: 8,
              minWidth: 200,
              marginTop: 4
            }}>
              {hiddenFilters.map((filterKey) => {
                const filter = getFilterInfo(filterKey);
                if (!filter) return null;
                
                return (
                  <button
                    key={filter.key}
                    onClick={() => handleFilterClick(filter.key)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: 6,
                      backgroundColor: currentFilter === filter.key ? `${filter.color}15` : 'transparent',
                      color: currentFilter === filter.key ? filter.color : '#495057',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: currentFilter === filter.key ? 'bold' : 'normal',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      marginBottom: 4
                    }}
                    onMouseEnter={(e) => {
                      if (currentFilter !== filter.key) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentFilter !== filter.key) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <span>{filter.label}</span>
                    {filter.count > 0 && (
                      <span style={{
                        backgroundColor: currentFilter === filter.key ? filter.color : '#6c757d',
                        color: 'white',
                        borderRadius: 10,
                        padding: '2px 6px',
                        fontSize: 11,
                        fontWeight: 'bold',
                        minWidth: 18,
                        textAlign: 'center'
                      }}>
                        {filter.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      
      {/* Кнопка очистки фильтров */}
      {currentFilter !== 'all' && (
        <button
          onClick={() => onFilterChange('all')}
          style={{
            padding: '6px 12px',
            border: 'none',
            borderRadius: 15,
            backgroundColor: '#f8f9fa',
            color: '#6c757d',
            cursor: 'pointer',
            fontSize: 12,
            marginLeft: 8
          }}
          title="Очистить фильтры"
        >
          ✕ Сбросить
        </button>
      )}
    </div>
  );
}
