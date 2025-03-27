// pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useAPI, DashboardData } from '../hooks/useAPI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const DashboardPage = () => {
  const { loading, error, apiCall } = useAPI();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await apiCall<DashboardData>('/dashboard');
        setDashboardData(data);
      } catch (err) {
        console.error('대시보드 데이터 로딩 오류:', err);
      }
    };
    
    fetchDashboardData();
  }, [apiCall]);
  
  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error && !dashboardData) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
        <p className="font-bold">오류</p>
        <p>{error.message}</p>
      </div>
    );
  }
  
  if (!dashboardData) {
    return null;
  }
  
  // 사용자 활동 데이터 변환
  const userActivityData = [
    {
      name: '카카오톡',
      사용자: dashboardData.userActivity.kakao.users,
      일일활동: dashboardData.userActivity.kakao.dailyInteractions,
    },
    {
      name: '슬랙',
      사용자: dashboardData.userActivity.slack.users,
      일일활동: dashboardData.userActivity.slack.dailyInteractions,
    },
  ];
  
  // 인기 추천 데이터 변환
  const popularRecommendationData = dashboardData.popularRecommendations.map(item => ({
    name: item.restaurantName,
    value: item.recommendCount,
  }));
  
  // 파이 차트 색상
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  // 타임스탬프를 시간 형식으로 변환
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${month}/${day} ${hours}:${minutes}`;
  };
  
  // 활동 타입에 따른 배지 스타일
  const getActivityBadgeStyle = (type: string): string => {
    switch (type) {
      case 'recommendation':
        return 'bg-green-100 text-green-800';
      case 'bot':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="mt-1 text-sm text-gray-600">
          인하런치픽 서비스 현황 및 통계
        </p>
      </div>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">등록된 식당</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.statistics.totalRestaurants}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">등록된 메뉴</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.statistics.totalMenus}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">활성 사용자</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.statistics.activeUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">총 추천 횟수</p>
              <p className="text-2xl font-semibold text-gray-900">{dashboardData.statistics.totalRecommendations}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* 차트 및 통계 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">사용자 활동</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="사용자" fill="#8884d8" />
                <Bar dataKey="일일활동" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">인기 요청</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-indigo-600 mb-1">카카오톡</h5>
                  <ul className="text-sm">
                    {dashboardData.userActivity.kakao.topRequests.map((request, index) => (
                      <li key={index} className="mb-1">
                        {request}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-xs font-medium text-indigo-600 mb-1">슬랙</h5>
                  <ul className="text-sm">
                    {dashboardData.userActivity.slack.topRequests.map((request, index) => (
                      <li key={index} className="mb-1">
                        {request}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">인기 추천 식당</h3>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={popularRecommendationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {popularRecommendationData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}회`, '추천 횟수']} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">순위</h4>
              <ol className="list-decimal list-inside text-sm">
                {dashboardData.popularRecommendations.map((restaurant, index) => (
                  <li key={index} className="mb-1">
                    <span className="font-medium">{restaurant.restaurantName}</span>
                    <span className="text-gray-500 ml-2">{restaurant.recommendCount}회</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      {/* 최근 활동 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">최근 활동</h3>
        </div>
        <div className="p-6">
          <ul className="divide-y divide-gray-200">
            {dashboardData.recentActivity.map((activity, index) => (
              <li key={index} className="py-4 flex">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityBadgeStyle(activity.type)}`}>
                  {activity.type === 'recommendation' && '추천'}
                  {activity.type === 'bot' && '봇'}
                  {activity.type === 'admin' && '관리자'}
                </span>
                <p className="ml-3 text-sm text-gray-700">{activity.description}</p>
                <span className="ml-auto text-sm text-gray-500">{formatTimestamp(activity.timestamp)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;