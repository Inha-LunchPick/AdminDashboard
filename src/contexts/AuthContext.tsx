// contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // AWS Amplify Auth 세션 확인
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      // 실제로는 AWS Amplify가 설정되어 있어야 함
      // 현재는 로컬 스토리지로 모의 인증 처리
      const storedUser = localStorage.getItem('authenticated_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('인증 상태 확인 중 오류 발생:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(username: string, password: string) {
    try {
      // 실제 구현에서는 AWS Cognito 호출
      // const user = await Auth.signIn(username, password);
      
      // 모의 로그인 로직 (개발 용도)
      if (username === 'admin' && password === 'password') {
        const mockUser = {
          username: 'admin',
          attributes: {
            email: 'admin@inhalunchpick.com',
            name: '관리자',
          }
        };
        localStorage.setItem('authenticated_user', JSON.stringify(mockUser));
        setUser(mockUser);
        return mockUser;
      } else {
        throw new Error('인증 실패: 사용자 이름 또는 비밀번호가 잘못되었습니다.');
      }
    } catch (error) {
      console.error('로그인 중 오류 발생:', error);
      throw error;
    }
  }

  async function logout() {
    try {
      // 실제 구현에서는 AWS Cognito 호출
      // await Auth.signOut();
      
      // 모의 로그아웃 로직
      localStorage.removeItem('authenticated_user');
      setUser(null);
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
      throw error;
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};