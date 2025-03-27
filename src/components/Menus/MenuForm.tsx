// components/Menus/MenuForm.tsx
import { useState, useEffect } from 'react';
import { Menu, Restaurant } from '../../hooks/useAPI';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface MenuFormProps {
  menu: Menu | null;
  restaurants: Restaurant[];
  onSave: (menuData: Partial<Menu>) => void;
  onCancel: () => void;
}

const categoryOptions = [
  '한식',
  '분식',
  '일식',
  '중식',
  '양식',
  '카페',
  '패스트푸드',
  '기타',
];

const MenuForm: React.FC<MenuFormProps> = ({ menu, restaurants, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Menu>>({
    name: '',
    restaurantId: restaurants.length > 0 ? restaurants[0].id : '',
    category: '한식',
    price: 0,
    description: '',
    tags: [],
  });
  
  const [tag, setTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        restaurantId: menu.restaurantId,
        category: menu.category,
        price: menu.price,
        description: menu.description,
        tags: [...menu.tags],
      });
    } else if (restaurants.length > 0) {
      setFormData(prev => ({
        ...prev,
        restaurantId: restaurants[0].id
      }));
    }
  }, [menu, restaurants]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
    
    // 에러 상태 지우기
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const addTag = () => {
    if (!tag) return;
    
    if (!formData.tags?.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tag],
      });
    }
    
    setTag('');
  };

  const removeTag = (item: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== item) || [],
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = '메뉴 이름은 필수입니다';
    }
    
    if (!formData.restaurantId) {
      newErrors.restaurantId = '식당은 필수입니다';
    }
    
    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = '가격은 0 이상이어야 합니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700">
          식당 <span className="text-red-500">*</span>
        </label>
        <select
          id="restaurantId"
          name="restaurantId"
          value={formData.restaurantId}
          onChange={handleChange}
          className={`mt-1 block w-full pl-3 pr-10 py-2 text-base focus:outline-none sm:text-sm rounded-md ${
            errors.restaurantId
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        >
          <option value="">식당 선택</option>
          {restaurants.map((restaurant) => (
            <option key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </option>
          ))}
        </select>
        {errors.restaurantId && (
          <p className="mt-2 text-sm text-red-600">{errors.restaurantId}</p>
        )}
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          메뉴 이름 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
            errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
        />
        {errors.name && (
          <p className="mt-2 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            카테고리
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {categoryOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">
            가격 <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleChange}
              className={`block w-full pr-12 sm:text-sm rounded-md ${
                errors.price
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="0"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">원</span>
            </div>
          </div>
          {errors.price && (
            <p className="mt-2 text-sm text-red-600">{errors.price}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          메뉴 설명
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="메뉴에 대한 설명을 입력하세요"
        />
      </div>

      <div>
        <label htmlFor="tag" className="block text-sm font-medium text-gray-700">
          태그
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            name="tag"
            id="tag"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
            placeholder="태그 입력 (예: 매운맛, 인기메뉴)"
          />
          <button
            type="button"
            onClick={addTag}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:text-gray-700 hover:bg-gray-100"
          >
            추가
          </button>
        </div>
        {formData.tags && formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeTag(item)}
                  className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <span className="sr-only">태그 제거</span>
                  <XCircleIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          취소
        </button>
        <button
          type="submit"
          className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          저장
        </button>
      </div>
    </form>
  );
};

export default MenuForm;