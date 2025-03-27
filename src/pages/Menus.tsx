// pages/Menus.tsx
import { useState, useEffect } from 'react';
import { useAPI, Menu, Restaurant } from '../hooks/useAPI';
import { PlusIcon, PencilIcon, TrashIcon, ExclamationCircleIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import MenuForm from '../components/Menus/MenuForm';

const MenusPage = () => {
  const { loading, error, apiCall } = useAPI();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [filters, setFilters] = useState({
    restaurantId: '',
    category: '',
    minPrice: '',
    maxPrice: '',
  });
  
  useEffect(() => {
    fetchRestaurants();
    fetchMenus();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const data = await apiCall<{ restaurants: Restaurant[] }>('/restaurants');
      setRestaurants(data.restaurants);
    } catch (err) {
      console.error('식당 데이터 로딩 오류:', err);
    }
  };

  const fetchMenus = async () => {
    try {
      const data = await apiCall<{ menus: Menu[] }>('/menus');
      setMenus(data.menus);
    } catch (err) {
      console.error('메뉴 데이터 로딩 오류:', err);
    }
  };

  const handleCreateClick = () => {
    setSelectedMenu(null);
    setFormMode('create');
    setIsFormOpen(true);
  };

  const handleEditClick = (menu: Menu) => {
    setSelectedMenu(menu);
    setFormMode('edit');
    setIsFormOpen(true);
  };

  const handleDeleteClick = (menu: Menu) => {
    setSelectedMenu(menu);
    setIsDeleteConfirmOpen(true);
  };

  const handleSaveMenu = async (menuData: Partial<Menu>) => {
    try {
      if (formMode === 'create') {
        await apiCall<Menu>('/menus', 'POST', menuData);
      } else {
        await apiCall<Menu>(`/menus/${selectedMenu?.id}`, 'PUT', {
          ...selectedMenu,
          ...menuData
        });
      }
      
      setIsFormOpen(false);
      fetchMenus();
    } catch (err) {
      console.error('메뉴 저장 오류:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMenu) return;
    
    try {
      await apiCall(`/menus/${selectedMenu.id}`, 'DELETE');
      setIsDeleteConfirmOpen(false);
      fetchMenus();
    } catch (err) {
      console.error('메뉴 삭제 오류:', err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      restaurantId: '',
      category: '',
      minPrice: '',
      maxPrice: '',
    });
  };

  // 필터 적용 로직
  const filteredMenus = menus.filter((menu) => {
    if (filters.restaurantId && menu.restaurantId !== filters.restaurantId) {
      return false;
    }
    
    if (filters.category && menu.category !== filters.category) {
      return false;
    }
    
    if (filters.minPrice && menu.price < Number(filters.minPrice)) {
      return false;
    }
    
    if (filters.maxPrice && menu.price > Number(filters.maxPrice)) {
      return false;
    }
    
    return true;
  });

  // 식당 이름 조회
  const getRestaurantName = (restaurantId: string): string => {
    const restaurant = restaurants.find(r => r.id === restaurantId);
    return restaurant ? restaurant.name : '알 수 없음';
  };

  // 식당별 카테고리 목록
  const menuCategories = Array.from(new Set(menus.map(menu => menu.category)));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">메뉴 관리</h1>
          <p className="mt-1 text-sm text-gray-600">
            식당별 메뉴 정보를 관리하세요
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreateClick}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          메뉴 추가
        </button>
      </div>
      
      {/* 필터 패널 */}
      <div className="bg-white shadow p-4 rounded-lg mb-6">
        <div className="flex items-center mb-4">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-gray-700 text-sm font-medium">필터</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="restaurantId" className="block text-sm font-medium text-gray-700">
              식당
            </label>
            <select
              id="restaurantId"
              name="restaurantId"
              value={filters.restaurantId}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">전체</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              카테고리
            </label>
            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="">전체</option>
              {menuCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
              최소 가격
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={filters.minPrice}
              onChange={handleFilterChange}
              placeholder="0"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
              최대 가격
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              placeholder="50000"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            필터 초기화
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">오류</p>
          <p>{error.message}</p>
        </div>
      )}

      {loading && menus.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {filteredMenus.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    메뉴
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    식당
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가격
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    특징
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">편집</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMenus.map((menu) => (
                  <tr key={menu.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600">{menu.name}</div>
                      <div className="text-sm text-gray-500">{menu.description.substring(0, 50)}{menu.description.length > 50 ? '...' : ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getRestaurantName(menu.restaurantId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {menu.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {menu.price.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {menu.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2 justify-end">
                        <button
                          type="button"
                          onClick={() => handleEditClick(menu)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <PencilIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(menu)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-4 py-6 text-center text-gray-500">
              {menus.length > 0 ? '필터 조건에 맞는 메뉴가 없습니다.' : '등록된 메뉴가 없습니다. 새 메뉴를 추가해주세요.'}
            </div>
          )}
        </div>
      )}

      {/* 메뉴 폼 모달 */}
      <Transition.Root show={isFormOpen} as={Fragment}>
        <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" onClose={setIsFormOpen}>
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
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
                      {formMode === 'create' ? '메뉴 추가' : '메뉴 수정'}
                    </Dialog.Title>
                    <div className="mt-4">
                      <MenuForm
                        menu={selectedMenu}
                        restaurants={restaurants}
                        onSave={handleSaveMenu}
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
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
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
                      메뉴 삭제
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        '{selectedMenu?.name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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

export default MenusPage;