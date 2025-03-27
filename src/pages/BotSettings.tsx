// pages/BotSettings.tsx
import { useState, useEffect } from 'react';
import { useAPI, KakaoSettings, SlackSettings } from '../hooks/useAPI';
import { Tab } from '@headlessui/react';
import { ChatBubbleLeftRightIcon, CodeBracketIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

const BotSettingsPage = () => {
  const { loading, error, apiCall } = useAPI();
  const [kakaoSettings, setKakaoSettings] = useState<KakaoSettings | null>(null);
  const [slackSettings, setSlackSettings] = useState<SlackSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  // 카카오톡 설정 폼 상태
  const [kakaoForm, setKakaoForm] = useState({
    enabled: true,
    botId: '',
    apiKey: '',
    welcomeMessage: '',
  });

  // 슬랙 설정 폼 상태
  const [slackForm, setSlackForm] = useState({
    enabled: true,
    botId: '',
    apiToken: '',
    workspaceId: '',
    channels: [] as string[],
  });

  // 슬랙 채널 추가 상태
  const [newChannel, setNewChannel] = useState('');

  useEffect(() => {
    fetchBotSettings();
  }, []);

  useEffect(() => {
    // 카카오톡 설정 로드
    if (kakaoSettings) {
      setKakaoForm({
        enabled: kakaoSettings.enabled,
        botId: kakaoSettings.botId,
        apiKey: kakaoSettings.apiKey,
        welcomeMessage: kakaoSettings.welcomeMessage,
      });
    }
    
    // 슬랙 설정 로드
    if (slackSettings) {
      setSlackForm({
        enabled: slackSettings.enabled,
        botId: slackSettings.botId,
        apiToken: slackSettings.apiToken,
        workspaceId: slackSettings.workspaceId,
        channels: [...slackSettings.channels],
      });
    }
  }, [kakaoSettings, slackSettings]);

  const fetchBotSettings = async () => {
    try {
      const data = await apiCall<{ kakao: KakaoSettings, slack: SlackSettings }>('/bot-settings');
      setKakaoSettings(data.kakao);
      setSlackSettings(data.slack);
    } catch (err) {
      console.error('봇 설정 로딩 오류:', err);
    }
  };

  const handleKakaoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setKakaoForm(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setKakaoForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSlackChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setSlackForm(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setSlackForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addSlackChannel = () => {
    if (!newChannel.trim()) return;
    
    if (!slackForm.channels.includes(newChannel)) {
      setSlackForm(prev => ({
        ...prev,
        channels: [...prev.channels, newChannel]
      }));
    }
    
    setNewChannel('');
  };

  const removeSlackChannel = (channel: string) => {
    setSlackForm(prev => ({
      ...prev,
      channels: prev.channels.filter(c => c !== channel)
    }));
  };

  const saveKakaoSettings = async () => {
    try {
      setSaveStatus('loading');
      setStatusMessage('카카오톡 봇 설정 저장 중...');
      
      await apiCall<KakaoSettings>('/bot-settings/kakao', 'PUT', kakaoForm);
      
      setSaveStatus('success');
      setStatusMessage('카카오톡 봇 설정이 저장되었습니다.');
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (err) {
      console.error('카카오톡 설정 저장 오류:', err);
      setSaveStatus('error');
      setStatusMessage('카카오톡 봇 설정 저장 중 오류가 발생했습니다.');
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const saveSlackSettings = async () => {
    try {
      setSaveStatus('loading');
      setStatusMessage('슬랙 봇 설정 저장 중...');
      
      await apiCall<SlackSettings>('/bot-settings/slack', 'PUT', slackForm);
      
      setSaveStatus('success');
      setStatusMessage('슬랙 봇 설정이 저장되었습니다.');
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 3000);
    } catch (err) {
      console.error('슬랙 설정 저장 오류:', err);
      setSaveStatus('error');
      setStatusMessage('슬랙 봇 설정 저장 중 오류가 발생했습니다.');
      
      // 3초 후 상태 초기화
      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 3000);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">봇 설정</h1>
          <p className="mt-1 text-sm text-gray-600">
            카카오톡과 슬랙 봇 연동 설정을 관리하세요
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">오류</p>
          <p>{error.message}</p>
        </div>
      )}

      {/* 알림 메시지 */}
      {saveStatus !== 'idle' && (
        <div
          className={classNames(
            'p-4 mb-6 rounded-md',
            saveStatus === 'loading' ? 'bg-blue-50 text-blue-700' : '',
            saveStatus === 'success' ? 'bg-green-50 text-green-700' : '',
            saveStatus === 'error' ? 'bg-red-50 text-red-700' : ''
          )}
        >
          <div className="flex">
            <div className="flex-shrink-0">
              {saveStatus === 'loading' && (
                <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {saveStatus === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-400" />}
              {saveStatus === 'error' && <ExclamationCircleIcon className="h-5 w-5 text-red-400" />}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {statusMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {loading && !kakaoSettings && !slackSettings ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
                )
              }
            >
              <div className="flex items-center justify-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                카카오톡 봇
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-indigo-700 shadow'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-700'
                )
              }
            >
              <div className="flex items-center justify-center">
                <CodeBracketIcon className="w-5 h-5 mr-2" />
                슬랙 봇
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-6">
            {/* 카카오톡 봇 설정 */}
            <Tab.Panel className="rounded-xl bg-white p-6 shadow">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">카카오톡 봇 설정</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      카카오톡 i 오픈빌더에 연결된 인하런치픽 봇 설정을 관리합니다.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">활성화</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        name="enabled"
                        id="kakao-toggle"
                        checked={kakaoForm.enabled}
                        onChange={handleKakaoChange}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="kakao-toggle"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                          kakaoForm.enabled ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                      ></label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="botId" className="block text-sm font-medium text-gray-700">봇 ID</label>
                      <input
                        type="text"
                        name="botId"
                        id="botId"
                        value={kakaoForm.botId}
                        onChange={handleKakaoChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">API 키</label>
                      <input
                        type="password"
                        name="apiKey"
                        id="apiKey"
                        value={kakaoForm.apiKey}
                        onChange={handleKakaoChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">환영 메시지</label>
                      <textarea
                        name="welcomeMessage"
                        id="welcomeMessage"
                        rows={3}
                        value={kakaoForm.welcomeMessage}
                        onChange={handleKakaoChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="사용자가 처음 채팅을 시작할 때 보여줄 환영 메시지를 입력하세요."
                      />
                    </div>
                  </div>
                </div>

                {kakaoSettings && (
                  <div className="rounded-md bg-gray-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-blue-800">봇 정보</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>마지막 업데이트: {formatDate(kakaoSettings.lastUpdated)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveKakaoSettings}
                    disabled={saveStatus === 'loading'}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      saveStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    설정 저장
                  </button>
                </div>
              </div>
            </Tab.Panel>

            {/* 슬랙 봇 설정 */}
            <Tab.Panel className="rounded-xl bg-white p-6 shadow">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium leading-6 text-gray-900">슬랙 봇 설정</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      슬랙 워크스페이스에 연결된 인하런치픽 봇 설정을 관리합니다.
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">활성화</span>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none">
                      <input
                        type="checkbox"
                        name="enabled"
                        id="slack-toggle"
                        checked={slackForm.enabled}
                        onChange={handleSlackChange}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                      />
                      <label
                        htmlFor="slack-toggle"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                          slackForm.enabled ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                      ></label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label htmlFor="botId" className="block text-sm font-medium text-gray-700">봇 ID</label>
                      <input
                        type="text"
                        name="botId"
                        id="slack-botId"
                        value={slackForm.botId}
                        onChange={handleSlackChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="apiToken" className="block text-sm font-medium text-gray-700">API 토큰</label>
                      <input
                        type="password"
                        name="apiToken"
                        id="apiToken"
                        value={slackForm.apiToken}
                        onChange={handleSlackChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label htmlFor="workspaceId" className="block text-sm font-medium text-gray-700">워크스페이스 ID</label>
                      <input
                        type="text"
                        name="workspaceId"
                        id="workspaceId"
                        value={slackForm.workspaceId}
                        onChange={handleSlackChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-6">
                      <label htmlFor="channels" className="block text-sm font-medium text-gray-700">채널</label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <input
                          type="text"
                          name="newChannel"
                          id="newChannel"
                          value={newChannel}
                          onChange={(e) => setNewChannel(e.target.value)}
                          className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                          placeholder="예: #점심, #일반"
                        />
                        <button
                          type="button"
                          onClick={addSlackChannel}
                          className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:text-gray-700 hover:bg-gray-100"
                        >
                          추가
                        </button>
                      </div>
                      {slackForm.channels.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {slackForm.channels.map((channel, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                            >
                              {channel}
                              <button
                                type="button"
                                onClick={() => removeSlackChannel(channel)}
                                className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                              >
                                <span className="sr-only">채널 제거</span>
                                <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                                  <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {slackSettings && (
                  <div className="rounded-md bg-gray-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <InformationCircleIcon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-blue-800">봇 정보</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>마지막 업데이트: {formatDate(slackSettings.lastUpdated)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={saveSlackSettings}
                    disabled={saveStatus === 'loading'}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      saveStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    설정 저장
                  </button>
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
};

export default BotSettingsPage;