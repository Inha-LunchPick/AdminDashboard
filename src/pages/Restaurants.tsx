// pages/Restaurants.tsx
import { useState, useEffect } from 'react';
import { useAPI, Restaurant } from '../hooks/useAPI';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import RestaurantForm from '../components/Restaurants/RestaurantForm';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const RestaurantsPage = () => {
  const { loading, error, apiCall } = useAPI();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await apiCall<{ restaurants: Restaurant[] }>('/restaurants');
      setRestaurants(data.restaurants);
    } catch (err) {
      console.error('식당 데이터 로딩 오류:', err);
    }
  };

  const handleCreateClick = () => {
    setSelectedRestaurant(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDeleteConfirmOpen(true);
  };

  const handleSaveRestaurant = async (restaurantData: Partial<Restaurant>) => {
    try {
      if (formMode === 'create') {
        await apiCall<Restaurant>('/restaurants', 'POST', restaurantData);
      } else {
        await apiCall<Restaurant>(`/restaurants/${selectedRestaurant?.id}`, 'PUT', {
          ...selectedRestaurant,
          ...restaurantData
        });
      }
      
      setIsFormOpen(false);
      fetchRestaurants();
    } catch (err) {
      console.error('식당 저장 오류:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRestaurant) return;
    
    try {
      await apiCall(`/restaurants/${selectedRestaurant.id}`, 'DELETE');
      setIsDeleteConfirmOpen(false);
      fetchRestaurants();
    } catch (err) {
      console.error('식당 삭제 오류:', err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">식당 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            인하대 주변 식당 정보를 관리하세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateClick}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          식당 추가
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">오류</p>
          <p>{error.message}</p>
        </div>
      )}

      {loading && restaurants.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {restaurants.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {restaurants.map((restaurant) => (
                <li key={restaurant.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 mr-4">
                          {restaurant.imageUrls && restaurant.imageUrls.length > 0 ? (
                            <img
                              src={restaurant.imageUrls[0]}
                              alt={restaurant.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-indigo-600">{restaurant.name}</p>
                          <p className="text-sm text-gray-500">
                            {restaurant.category} • {restaurant.priceRange} • {restaurant.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEditClick(restaurant)}
                          className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <PencilIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(restaurant)}
                          className="inline-flex items-center p-1.5 border border-gray-300 shadow-sm text-xs rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <TrashIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          영업시간: {restaurant.operatingHours}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          {restaurant.isAvailableForSolo ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              1인 식사 가능
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              1인 식사 불가
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          대표 메뉴: {restaurant.specialties.join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              등록된 식당이 없습니다. 새 식당을 추가해주세요.
            </div>
          )}
        </div>
      )}

      {/* 식당 폼 모달 */}
      <Transition.Root show={isFormOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setIsFormOpen}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      {formMode === 'create' ? '식당 추가' : '식당 수정'}
                    </Dialog.Title>
                    <div className="mt-4">
                      <RestaurantForm
                        restaurant={selectedRestaurant}
                        onSave={handleSaveRestaurant}
                        onCancel={() => setIsFormOpen(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* 삭제 확인 모달 */}
      <Transition.Root show={isDeleteConfirmOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setIsDeleteConfirmOpen}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationCircleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      식당 삭제
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        '{selectedRestaurant?.name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        연결된 모든 메뉴도 함께 삭제됩니다.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleDeleteConfirm}
                  >
                    삭제
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                    onClick={() => setIsDeleteConfirmOpen(false)}
                  >
                    취소
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default RestaurantsPage;