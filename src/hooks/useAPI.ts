// hooks/useAPI.ts
import { useState, useCallback } from 'react';

// API 요청 상태 타입
export interface APIState {
  loading: boolean;
  error: Error | null;
}

// API 요청 메서드
export type APIMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

// API 호출 훅
export const useAPI = () => {
  const [state, setState] = useState<APIState>({
    loading: false,
    error: null,
  });

  const apiCall = useCallback(async <T>(
    endpoint: string, 
    method: APIMethod = 'GET', 
    data: any = null
  ): Promise<T> => {
    setState({ loading: true, error: null });

    try {
      // 로컬 스토리지에서 인증 토큰 가져오기 (개발 용도)
      const userData = localStorage.getItem('authenticated_user');
      const token = userData ? 'mock-jwt-token' : null;

      if (!token) {
        throw new Error('인증 토큰을 찾을 수 없습니다.');
      }

      // API 요청 옵션
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      if (data) {
        options.body = JSON.stringify(data);
      }

      // 개발 환경에서는 API URL에 접두사 추가
      // const apiUrl = import.meta.env.DEV
      //   ? `http://localhost:3000${endpoint}`
      //   : `https://api.inhalunchpick.com${endpoint}`;

      // 실제 API 호출
      // const response = await fetch(apiUrl, options);
      
      // 모의 API 응답 (개발 용도)
      const mockResponse = await mockAPICall<T>(endpoint, method, data);
      
      setState({ loading: false, error: null });
      return mockResponse;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('알 수 없는 오류가 발생했습니다.');
      setState({ loading: false, error: err });
      throw err;
    }
  }, []);

  return { 
    ...state,
    apiCall,
  };
};

// 모의 API 호출 (개발 용)
async function mockAPICall<T>(endpoint: string, method: APIMethod, data: any = null): Promise<T> {
  // API 응답 지연 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 엔드포인트별 모의 응답
  if (endpoint.includes('/restaurants')) {
    return mockRestaurantsAPI(endpoint, method, data) as unknown as T;
  }
  
  if (endpoint.includes('/menus')) {
    return mockMenusAPI(endpoint, method, data) as unknown as T;
  }
  
  if (endpoint.includes('/recommendations')) {
    return mockRecommendationsAPI(endpoint, method, data) as unknown as T;
  }
  
  if (endpoint.includes('/bot-settings')) {
    return mockBotSettingsAPI(endpoint, method, data) as unknown as T;
  }
  
  if (endpoint.includes('/dashboard')) {
    return mockDashboardAPI(endpoint, method, data) as unknown as T;
  }
  
  throw new Error(`지원되지 않는 엔드포인트: ${endpoint}`);
}

// 식당 API 모의 구현
function mockRestaurantsAPI(endpoint: string, method: APIMethod, data: any = null) {
  const mockRestaurants = [
    {
      id: 'restaurant_001',
      name: '맛있는 분식',
      category: '분식',
      location: '인하대 정문 앞',
      priceRange: '저렴',
      specialties: ['떡볶이', '순대', '튀김'],
      operatingHours: '10:00-21:00',
      isAvailableForSolo: true,
      imageUrls: ['https://via.placeholder.com/150'],
      createdAt: new Date().getTime() - 3000000,
      updatedAt: new Date().getTime() - 100000,
    },
    {
      id: 'restaurant_002',
      name: '인하식당',
      category: '한식',
      location: '인하대 후문 근처',
      priceRange: '보통',
      specialties: ['제육볶음', '된장찌개', '비빔밥'],
      operatingHours: '11:00-20:00',
      isAvailableForSolo: true,
      imageUrls: ['https://via.placeholder.com/150'],
      createdAt: new Date().getTime() - 5000000,
      updatedAt: new Date().getTime() - 200000,
    },
    {
      id: 'restaurant_003',
      name: '스시하우스',
      category: '일식',
      location: '인하대 도서관 앞',
      priceRange: '고급',
      specialties: ['초밥', '우동', '돈카츠'],
      operatingHours: '11:30-21:30',
      isAvailableForSolo: false,
      imageUrls: ['https://via.placeholder.com/150'],
      createdAt: new Date().getTime() - 7000000,
      updatedAt: new Date().getTime() - 300000,
    },
  ];
  
  if (method === 'GET') {
    if (endpoint.includes('/restaurants/') && !endpoint.endsWith('/restaurants')) {
      // 단일 식당 조회
      const id = endpoint.split('/').pop();
      const restaurant = mockRestaurants.find(r => r.id === id);
      return restaurant || { error: '식당을 찾을 수 없습니다.' };
    }
    
    // 식당 목록 조회
    return { restaurants: mockRestaurants };
  }
  
  if (method === 'POST') {
    // 새 식당 추가
    return { ...data, id: `restaurant_${Math.floor(Math.random() * 1000)}` };
  }
  
  if (method === 'PUT') {
    // 식당 업데이트
    return { ...data, updatedAt: new Date().getTime() };
  }
  
  if (method === 'DELETE') {
    // 식당 삭제
    return { success: true, message: '식당이 삭제되었습니다.' };
  }
  
  return { error: '지원되지 않는 메서드입니다.' };
}

// 메뉴 API 모의 구현
function mockMenusAPI(endpoint: string, method: APIMethod, data: any = null) {
  const mockMenus = [
    {
      id: 'menu_001',
      restaurantId: 'restaurant_001',
      name: '떡볶이',
      category: '분식',
      price: 5000,
      description: '매콤한 국내산 쌀떡과 특제 소스',
      tags: ['매운맛', '인기메뉴'],
      createdAt: new Date().getTime() - 3000000,
      updatedAt: new Date().getTime() - 100000,
    },
    {
      id: 'menu_002',
      restaurantId: 'restaurant_001',
      name: '김밥',
      category: '분식',
      price: 4000,
      description: '신선한 재료로 만든 일반 김밥',
      tags: ['인기메뉴', '1인분'],
      createdAt: new Date().getTime() - 4000000,
      updatedAt: new Date().getTime() - 200000,
    },
    {
      id: 'menu_003',
      restaurantId: 'restaurant_002',
      name: '제육볶음',
      category: '한식',
      price: 8000,
      description: '매콤한 고추장 양념의 돼지고기 볶음',
      tags: ['매운맛', '점심메뉴'],
      createdAt: new Date().getTime() - 5000000,
      updatedAt: new Date().getTime() - 150000,
    },
    {
      id: 'menu_004',
      restaurantId: 'restaurant_003',
      name: '모듬초밥',
      category: '일식',
      price: 15000,
      description: '신선한 해산물로 만든 10가지 초밥',
      tags: ['인기메뉴', '고급'],
      createdAt: new Date().getTime() - 6000000,
      updatedAt: new Date().getTime() - 250000,
    },
  ];
  
  if (method === 'GET') {
    if (endpoint.includes('/menus/') && !endpoint.endsWith('/menus')) {
      // 단일 메뉴 조회
      const id = endpoint.split('/').pop();
      const menu = mockMenus.find(m => m.id === id);
      return menu || { error: '메뉴를 찾을 수 없습니다.' };
    }
    
    if (endpoint.includes('/restaurants/') && endpoint.includes('/menus')) {
      // 식당별 메뉴 조회
      const restaurantId = endpoint.split('/').filter(s => s.includes('restaurant_'))[0];
      const restaurantMenus = mockMenus.filter(m => m.restaurantId === restaurantId);
      return { menus: restaurantMenus };
    }
    
    // 전체 메뉴 조회
    return { menus: mockMenus };
  }
  
  if (method === 'POST') {
    // 새 메뉴 추가
    return { ...data, id: `menu_${Math.floor(Math.random() * 1000)}` };
  }
  
  if (method === 'PUT') {
    // 메뉴 업데이트
    return { ...data, updatedAt: new Date().getTime() };
  }
  
  if (method === 'DELETE') {
    // 메뉴 삭제
    return { success: true, message: '메뉴가 삭제되었습니다.' };
  }
  
  return { error: '지원되지 않는 메서드입니다.' };
}

// 추천 API 모의 구현
function mockRecommendationsAPI(endpoint: string, method: APIMethod, data: any = null) {
  const mockRecommendations = [
    {
      date: '2025-03-27',
      lunchRecommendation: {
        restaurantId: 'restaurant_001',
        menuIds: ['menu_001', 'menu_002'],
        reason: '비 오는 날씨에 따뜻한 국물 요리를 추천합니다.',
      },
      dinnerRecommendation: {
        restaurantId: 'restaurant_002',
        menuIds: ['menu_003'],
        reason: '활력을 되찾기 위한 든든한 저녁 메뉴입니다.',
      },
      createdAt: new Date().getTime() - 8000000,
    },
    {
      date: '2025-03-26',
      lunchRecommendation: {
        restaurantId: 'restaurant_003',
        menuIds: ['menu_004'],
        reason: '수요일은 초밥 먹는 날! 가벼운 점심으로 완벽합니다.',
      },
      dinnerRecommendation: {
        restaurantId: 'restaurant_002',
        menuIds: ['menu_003'],
        reason: '저녁에는 든든한 한식 어떠세요?',
      },
      createdAt: new Date().getTime() - 86400000,
    },
  ];
  
  if (method === 'GET') {
    if (endpoint.includes('/recommendations/') && !endpoint.endsWith('/recommendations')) {
      // 특정 날짜 추천 조회
      const date = endpoint.split('/').pop();
      const recommendation = mockRecommendations.find(r => r.date === date);
      return recommendation || { error: '해당 날짜의 추천을 찾을 수 없습니다.' };
    }
    
    // 전체 추천 목록 조회
    return { recommendations: mockRecommendations };
  }
  
  if (method === 'POST') {
    // 새 추천 생성
    return { ...data, createdAt: new Date().getTime() };
  }
  
  if (method === 'PUT') {
    // 추천 업데이트
    return { ...data, updatedAt: new Date().getTime() };
  }
  
  return { error: '지원되지 않는 메서드입니다.' };
}

// 봇 설정 API 모의 구현
function mockBotSettingsAPI(endpoint: string, method: APIMethod, data: any = null) {
  const mockBotSettings = {
    kakao: {
      enabled: true,
      botId: 'kakao_bot_12345',
      apiKey: '******************',
      welcomeMessage: '안녕하세요! 인하런치픽입니다. 오늘 점심 추천해 드릴까요?',
      lastUpdated: new Date().getTime() - 3000000,
    },
    slack: {
      enabled: true,
      botId: 'slack_bot_67890',
      apiToken: '******************',
      workspaceId: 'T01ABCDEFGH',
      channels: ['#점심', '#일반'],
      lastUpdated: new Date().getTime() - 5000000,
    },
  };
  
  if (method === 'GET') {
    if (endpoint.includes('/kakao')) {
      return mockBotSettings.kakao;
    }
    
    if (endpoint.includes('/slack')) {
      return mockBotSettings.slack;
    }
    
    // 전체 봇 설정 조회
    return mockBotSettings;
  }
  
  if (method === 'PUT') {
    // 봇 설정 업데이트
    return { ...data, lastUpdated: new Date().getTime() };
  }
  
  return { error: '지원되지 않는 메서드입니다.' };
}

// 대시보드 API 모의 구현
function mockDashboardAPI(endpoint: string, method: APIMethod, _data: any = null) {
  const mockDashboardData = {
    statistics: {
      totalRestaurants: 27,
      totalMenus: 152,
      activeUsers: 187,
      totalRecommendations: 365,
    },
    userActivity: {
      kakao: {
        users: 120,
        dailyInteractions: 240,
        topRequests: ['점심추천', '1인식사', '한식추천'],
      },
      slack: {
        users: 67,
        dailyInteractions: 105,
        topRequests: ['/점심', '/저녁', '/랜덤추천'],
      },
    },
    popularRecommendations: [
      {
        restaurantId: 'restaurant_001',
        restaurantName: '맛있는 분식',
        recommendCount: 42,
      },
      {
        restaurantId: 'restaurant_002',
        restaurantName: '인하식당',
        recommendCount: 38,
      },
      {
        restaurantId: 'restaurant_003',
        restaurantName: '스시하우스',
        recommendCount: 27,
      },
    ],
    recentActivity: [
      {
        type: 'recommendation',
        description: '오늘의 점심 추천이 생성되었습니다.',
        timestamp: new Date().getTime() - 3600000,
      },
      {
        type: 'bot',
        description: '카카오톡 봇이 20건의 메시지를 처리했습니다.',
        timestamp: new Date().getTime() - 7200000,
      },
      {
        type: 'admin',
        description: '새로운 식당 "버거킹"이 추가되었습니다.',
        timestamp: new Date().getTime() - 86400000,
      },
    ],
  };
  
  if (method === 'GET') {
    return mockDashboardData;
  }
  
  return { error: '지원되지 않는 메서드입니다.' };
}

// 모델 타입 정의
export interface Restaurant {
  id: string;
  name: string;
  category: string;
  location: string;
  priceRange: string;
  specialties: string[];
  operatingHours: string;
  isAvailableForSolo: boolean;
  imageUrls: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Menu {
  id: string;
  restaurantId: string;
  name: string;
  category: string;
  price: number;
  description: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Recommendation {
  date: string;
  lunchRecommendation: {
    restaurantId: string;
    menuIds: string[];
    reason: string;
  };
  dinnerRecommendation: {
    restaurantId: string;
    menuIds: string[];
    reason: string;
  };
  createdAt: number;
}

export interface KakaoSettings {
  enabled: boolean;
  botId: string;
  apiKey: string;
  welcomeMessage: string;
  lastUpdated: number;
}

export interface SlackSettings {
  enabled: boolean;
  botId: string;
  apiToken: string;
  workspaceId: string;
  channels: string[];
  lastUpdated: number;
}

export interface DashboardStatistics {
  totalRestaurants: number;
  totalMenus: number;
  activeUsers: number;
  totalRecommendations: number;
}

export interface UserActivity {
  kakao: {
    users: number;
    dailyInteractions: number;
    topRequests: string[];
  };
  slack: {
    users: number;
    dailyInteractions: number;
    topRequests: string[];
  };
}

export interface PopularRecommendation {
  restaurantId: string;
  restaurantName: string;
  recommendCount: number;
}

export interface RecentActivity {
  type: 'recommendation' | 'bot' | 'admin';
  description: string;
  timestamp: number;
}

export interface DashboardData {
  statistics: DashboardStatistics;
  userActivity: UserActivity;
  popularRecommendations: PopularRecommendation[];
  recentActivity: RecentActivity[];
}