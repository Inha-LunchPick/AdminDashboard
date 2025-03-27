// pages/Recommendations.tsx
import { useState, useEffect } from 'react';
import { useAPI, Recommendation, Restaurant, Menu } from '../hooks/useAPI';
import { format, addDays, parseISO, isToday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const RecommendationsPage = () => {
  const { loading, error, apiCall } = useAPI();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    lunchRestaurantId: '',
    lunchMenuIds: [] as string[],
    lunchReason: '',
    dinnerRestaurantId: '',
    dinnerMenuIds: [] as string[],
    dinnerReason: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
    fetchRestaurants();
    fetchMenus();
  }, []);

  useEffect(() => {
    const recommendation = recommendations.find(r => r.date === selectedDate);
    setSelectedRecommendation(recommendation || null);
    
    // 폼 데이터 초기화
    if (recommendation) {
      setFormData({
        lunchRestaurantId: recommendation.lunchRecommendation.restaurantId,
        lunchMenuIds: [...recommendation.lunchRecommendation.menuIds],
        lunchReason: recommendation.lunchRecommendation.reason,
        dinnerRestaurantId: recommendation.dinnerRecommendation.restaurantId,
        dinnerMenuIds: [...recommendation.dinnerRecommendation.menuIds],
        dinnerReason: recommendation.dinnerRecommendation.reason,
      });
    } else {
      resetFormData();
    }
  }, [selectedDate, recommendations]);

  const resetFormData = () => {
    setFormData({
      lunchRestaurantId: restaurants.length > 0 ? restaurants[0].id : '',
      lunchMenuIds: [],
      lunchReason: '',
      dinnerRestaurantId: restaurants.length > 0 ? restaurants[0].id : '',
      dinnerMenuIds: [],
      dinnerReason: '',
    });
  };

  const fetchRecommendations = async () => {
    try {
      const data = await apiCall<{ recommendations: Recommendation[] }>('/recommendations');
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error('추천 데이터 로딩 오류:', err);
    }
  };

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

  // 식당 이름 가져오기
  const getRestaurantName = (id: string) => {
    const restaurant = restaurants.find(r => r.id === id);
    return restaurant ? restaurant.name : '알 수 없음';
  };

  // 메뉴 이름 목록 가져오기
  const getMenuNames = (ids: string[]) => {
    return ids.map(id => {
      const menu = menus.find(m => m.id === id);
      return menu ? menu.name : '알 수 없음';
    }).join(', ');
  };

  // 식당의 메뉴 목록 가져오기
  const getRestaurantMenus = (restaurantId: string) => {
    return menus.filter(menu => menu.restaurantId === restaurantId);
  };

  // 날짜 라벨 포맷
  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    let prefix = '';
    
    if (isToday(date)) {
      prefix = '오늘 - ';
    } else if (isTomorrow(date)) {
      prefix = '내일 - ';
    }
    
    return prefix + format(date, 'yyyy년 MM월 dd일 (eee)', { locale: ko });
  };

  // 다음 날짜 선택
  const handleNextDay = () => {
    const nextDay = format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd');
    setSelectedDate(nextDay);
  };

  // 이전 날짜 선택
  const handlePrevDay = () => {
    const prevDay = format(addDays(parseISO(selectedDate), -1), 'yyyy-MM-dd');
    setSelectedDate(prevDay);
  };

  // 추천 생성 또는 업데이트
  const handleSaveRecommendation = async () => {
    try {
      setFormLoading(true);
      
      const recommendationData = {
        date: selectedDate,
        lunchRecommendation: {
          restaurantId: formData.lunchRestaurantId,
          menuIds: formData.lunchMenuIds,
          reason: formData.lunchReason,
        },
        dinnerRecommendation: {
          restaurantId: formData.dinnerRestaurantId,
          menuIds: formData.dinnerMenuIds,
          reason: formData.dinnerReason,
        },
      };
      
      if (selectedRecommendation) {
        // 업데이트
        await apiCall<Recommendation>(`/recommendations/${selectedDate}`, 'PUT', recommendationData);
      } else {
        // 생성
        await apiCall<Recommendation>('/recommendations', 'POST', recommendationData);
      }
      
      fetchRecommendations();
      setIsFormOpen(false);
      setFormLoading(false);
    } catch (err) {
      console.error('추천 저장 오류:', err);
      setFormLoading(false);
    }
  };

  // 자동 추천 생성
  const handleGenerateRecommendation = async () => {
    try {
      setFormLoading(true);
      
      // 여기서는 단순히 랜덤으로 선택하지만, 실제로는 서버에서 알고리즘을 통해 추천이 생성됨
      const randomRestaurantLunch = restaurants[Math.floor(Math.random() * restaurants.length)];
      const randomRestaurantDinner = restaurants[Math.floor(Math.random() * restaurants.length)];
      
      const lunchMenus = getRestaurantMenus(randomRestaurantLunch.id).slice(0, 2);
      const dinnerMenus = getRestaurantMenus(randomRestaurantDinner.id).slice(0, 2);
      
      setFormData({
        lunchRestaurantId: randomRestaurantLunch.id,
        lunchMenuIds: lunchMenus.map(m => m.id),
        lunchReason: `${randomRestaurantLunch.name}에서는 맛있는 ${lunchMenus.map(m => m.name).join(', ')}을(를) 드실 수 있습니다.`,
        dinnerRestaurantId: randomRestaurantDinner.id,
        dinnerMenuIds: dinnerMenus.map(m => m.id),
        dinnerReason: `${randomRestaurantDinner.name}의 ${dinnerMenus.map(m => m.name).join(', ')}은(는) 저녁 식사로 완벽합니다.`,
      });
      
      setFormLoading(false);
    } catch (err) {
      console.error('추천 생성 오류:', err);
      setFormLoading(false);
    }
  };

  // 폼 데이터 변경 처리
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 메뉴 선택 처리
  const handleMenuSelectionChange = (mealType: 'lunch' | 'dinner', menuId: string, checked: boolean) => {
    const menuIdsField = `${mealType}MenuIds` as 'lunchMenuIds' | 'dinnerMenuIds';
    
    if (checked) {
      // 추가
      setFormData(prev => ({
        ...prev,
        [menuIdsField]: [...prev[menuIdsField], menuId]
      }));
    } else {
      // 제거
      setFormData(prev => ({
        ...prev,
        [menuIdsField]: prev[menuIdsField].filter(id => id !== menuId)
      }));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">추천 설정</h1>
          <p className="mt-1 text-sm text-gray-600">
            인하런치픽의 일별 식당 및 메뉴 추천을 관리하세요
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">오류</p>
          <p>{error.message}</p>
        </div>
      )}

      {/* 날짜 선택 */}
      <div className="flex justify-between items-center bg-white shadow rounded-lg p-4 mb-6">
        <button
          type="button"
          onClick={handlePrevDay}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          이전 날짜
        </button>
        
        <div className="flex items-center">
          <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          />
          <span className="ml-3 text-sm font-medium text-gray-700">
            {getDateLabel(selectedDate)}
          </span>
        </div>
        
        <button
          type="button"
          onClick={handleNextDay}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          다음 날짜
        </button>
      </div>

      {loading && !selectedRecommendation ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">{getDateLabel(selectedDate)} 추천</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {selectedRecommendation ? '이 날짜의 추천이 설정되어 있습니다' : '이 날짜의 추천이 아직 설정되지 않았습니다'}
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {selectedRecommendation ? (
                  <><PencilIcon className="-ml-1 mr-2 h-5 w-5" /> 추천 수정</>
                ) : (
                  <><ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" /> 추천 생성</>
                )}
              </button>
            </div>
          </div>

          {selectedRecommendation ? (
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                {/* 점심 추천 */}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">
                      점심
                    </span>
                    식당
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">
                    {getRestaurantName(selectedRecommendation.lunchRecommendation.restaurantId)}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">점심 메뉴</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {getMenuNames(selectedRecommendation.lunchRecommendation.menuIds)}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">점심 추천 이유</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedRecommendation.lunchRecommendation.reason}
                  </dd>
                </div>

                {/* 저녁 추천 */}
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                      저녁
                    </span>
                    식당
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">
                    {getRestaurantName(selectedRecommendation.dinnerRecommendation.restaurantId)}
                  </dd>
                </div>

                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">저녁 메뉴</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {getMenuNames(selectedRecommendation.dinnerRecommendation.menuIds)}
                  </dd>
                </div>

                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">저녁 추천 이유</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedRecommendation.dinnerRecommendation.reason}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <div className="px-4 py-10 sm:px-6 text-center text-gray-500">
              <p className="mb-4">선택한 날짜에 대한 추천이 없습니다.</p>
              <button
                type="button"
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                추천 생성하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 추천 설정 모달 */}
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
              <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
                <div className="sm:flex sm:items-start mb-4">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left sm:flex-grow">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-medium text-gray-900">
                      {selectedDate} 추천 설정
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {getDateLabel(selectedDate)}에 추천할 식당과 메뉴를 설정하세요.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <button
                      type="button"
                      onClick={handleGenerateRecommendation}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <ArrowPathIcon className="-ml-0.5 mr-1 h-4 w-4" />
                      자동 생성
                    </button>
                  </div>
                </div>
                
                <div className="mt-5 border-t border-gray-200 pt-5">
                  <div className="mb-6">
                    <h4 className="text-base font-medium text-gray-900 flex items-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 mr-2">
                        점심
                      </span>
                      점심 추천 설정
                    </h4>
                    
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="lunchRestaurantId" className="block text-sm font-medium text-gray-700">식당</label>
                        <select
                          id="lunchRestaurantId"
                          name="lunchRestaurantId"
                          value={formData.lunchRestaurantId}
                          onChange={handleFormChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          {restaurants.map((restaurant) => (
                            <option key={restaurant.id} value={restaurant.id}>
                              {restaurant.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="sm:col-span-6">
                        <fieldset>
                          <legend className="text-sm font-medium text-gray-700">메뉴 선택</legend>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {formData.lunchRestaurantId && getRestaurantMenus(formData.lunchRestaurantId).map((menu) => (
                              <div key={menu.id} className="relative flex items-start">
                                <div className="flex items-center h-5">
                                  <input
                                    id={`lunch-menu-${menu.id}`}
                                    name={`lunch-menu-${menu.id}`}
                                    type="checkbox"
                                    checked={formData.lunchMenuIds.includes(menu.id)}
                                    onChange={(e) => handleMenuSelectionChange('lunch', menu.id, e.target.checked)}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                  />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label htmlFor={`lunch-menu-${menu.id}`} className="font-medium text-gray-700">
                                    {menu.name}
                                  </label>
                                  <p className="text-gray-500">{menu.price.toLocaleString()}원</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </fieldset>
                      </div>
                      
                      <div className="sm:col-span-6">
                        <label htmlFor="lunchReason" className="block text-sm font-medium text-gray-700">추천 이유</label>
                        <textarea
                          id="lunchReason"
                          name="lunchReason"
                          rows={2}
                          value={formData.lunchReason}
                          onChange={handleFormChange}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="해당 식당과 메뉴를 추천하는 이유를 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-base font-medium text-gray-900 flex items-center">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 mr-2">
                        저녁
                      </span>
                      저녁 추천 설정
                    </h4>
                    
                    <div className="mt-4 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="dinnerRestaurantId" className="block text-sm font-medium text-gray-700">식당</label>
                        <select
                          id="dinnerRestaurantId"
                          name="dinnerRestaurantId"
                          value={formData.dinnerRestaurantId}
                          onChange={handleFormChange}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                          {restaurants.map((restaurant) => (
                            <option key={restaurant.id} value={restaurant.id}>
                              {restaurant.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="sm:col-span-6">
                        <fieldset>
                          <legend className="text-sm font-medium text-gray-700">메뉴 선택</legend>
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {formData.dinnerRestaurantId && getRestaurantMenus(formData.dinnerRestaurantId).map((menu) => (
                              <div key={menu.id} className="relative flex items-start">
                                <div className="flex items-center h-5">
                                  <input
                                    id={`dinner-menu-${menu.id}`}
                                    name={`dinner-menu-${menu.id}`}
                                    type="checkbox"
                                    checked={formData.dinnerMenuIds.includes(menu.id)}
                                    onChange={(e) => handleMenuSelectionChange('dinner', menu.id, e.target.checked)}
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                  />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label htmlFor={`dinner-menu-${menu.id}`} className="font-medium text-gray-700">
                                    {menu.name}
                                  </label>
                                  <p className="text-gray-500">{menu.price.toLocaleString()}원</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </fieldset>
                      </div>
                      
                      <div className="sm:col-span-6">
                        <label htmlFor="dinnerReason" className="block text-sm font-medium text-gray-700">추천 이유</label>
                        <textarea
                          id="dinnerReason"
                          name="dinnerReason"
                          rows={2}
                          value={formData.dinnerReason}
                          onChange={handleFormChange}
                          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="해당 식당과 메뉴를 추천하는 이유를 입력하세요"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleSaveRecommendation}
                    disabled={formLoading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      formLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {formLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        저장 중...
                      </>
                    ) : (
                        '저장'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default RecommendationsPage;