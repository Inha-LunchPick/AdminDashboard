// components/Restaurants/RestaurantForm.tsx
import { useState, useEffect } from 'react';
import { Restaurant } from '../../hooks/useAPI';
import { XCircleIcon } from '@heroicons/react/24/solid';

interface RestaurantFormProps {
  restaurant: Restaurant | null;
  onSave: (restaurantData: Partial<Restaurant>) => void;
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

const priceRangeOptions = [
  '저렴',
  '보통',
  '고급',
];

const RestaurantForm: React.FC<RestaurantFormProps> = ({ restaurant, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Restaurant>>({
    name: '',
    category: '한식',
    location: '',
    priceRange: '보통',
    specialties: [],
    operatingHours: '',
    isAvailableForSolo: true,
    imageUrls: [],
  });
  
  const [specialty, setSpecialty] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name,
        category: restaurant.category,
        location: restaurant.location,
        priceRange: restaurant.priceRange,
        specialties: [...restaurant.specialties],
        operatingHours: restaurant.operatingHours,
        isAvailableForSolo: restaurant.isAvailableForSolo,
        imageUrls: [...restaurant.imageUrls],
      });
    }
  }, [restaurant]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
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

  const addSpecialty = () => {
    if (!specialty) return;
    
    if (!formData.specialties?.includes(specialty)) {
      setFormData({
        ...formData,
        specialties: [...(formData.specialties || []), specialty],
      });
    }
    
    setSpecialty('');
  };

  const removeSpecialty = (item: string) => {
    setFormData({
      ...formData,
      specialties: formData.specialties?.filter((s) => s !== item) || [],
    });
  };

  const addImageUrl = () => {
    if (!imageUrl) return;
    
    if (!formData.imageUrls?.includes(imageUrl)) {
      setFormData({
        ...formData,
        imageUrls: [...(formData.imageUrls || []), imageUrl],
      });
    }
    
    setImageUrl('');
  };

  const removeImageUrl = (url: string) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls?.filter((i) => i !== url) || [],
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = '식당 이름은 필수입니다';
    }
    
    if (!formData.location?.trim()) {
      newErrors.location = '위치는 필수입니다';
    }
    
    if (!formData.operatingHours?.trim()) {
      newErrors.operatingHours = '영업 시간은 필수입니다';
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
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          식당 이름 <span className="text-red-500">*</span>
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
          <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700">
            가격대
          </label>
          <select
            id="priceRange"
            name="priceRange"
            value={formData.priceRange}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            {priceRangeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          위치 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="location"
          id="location"
          value={formData.location}
          onChange={handleChange}
          className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
            errors.location ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          placeholder="예: 인하대 정문 앞"
        />
        {errors.location && (
          <p className="mt-2 text-sm text-red-600">{errors.location}</p>
        )}
      </div>

      <div>
        <label htmlFor="operatingHours" className="block text-sm font-medium text-gray-700">
          영업 시간 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="operatingHours"
          id="operatingHours"
          value={formData.operatingHours}
          onChange={handleChange}
          className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
            errors.operatingHours ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
          }`}
          placeholder="예: 10:00-21:00"
        />
        {errors.operatingHours && (
          <p className="mt-2 text-sm text-red-600">{errors.operatingHours}</p>
        )}
      </div>

      <div>
        <div className="flex items-center">
          <input
            id="isAvailableForSolo"
            name="isAvailableForSolo"
            type="checkbox"
            checked={formData.isAvailableForSolo}
            onChange={handleChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="isAvailableForSolo" className="ml-2 block text-sm text-gray-700">
            1인 식사 가능
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
          대표 메뉴
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            name="specialty"
            id="specialty"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
            placeholder="대표 메뉴 입력"
          />
          <button
            type="button"
            onClick={addSpecialty}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:text-gray-700 hover:bg-gray-100"
          >
            추가
          </button>
        </div>
        {formData.specialties && formData.specialties.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.specialties.map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeSpecialty(item)}
                  className="ml-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none focus:bg-indigo-500 focus:text-white"
                >
                  <span className="sr-only">메뉴 제거</span>
                  <XCircleIcon className="h-3 w-3" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
          이미지 URL
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            name="imageUrl"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
            placeholder="이미지 URL 입력"
          />
          <button
            type="button"
            onClick={addImageUrl}
            className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:text-gray-700 hover:bg-gray-100"
          >
            추가
          </button>
        </div>
        {formData.imageUrls && formData.imageUrls.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {formData.imageUrls.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt="식당 이미지" className="h-24 w-full object-cover rounded" />
                <button
                  type="button"
                  onClick={() => removeImageUrl(url)}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 rounded-full p-1 text-red-500 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <XCircleIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
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

export default RestaurantForm;