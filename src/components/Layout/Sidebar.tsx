// components/Layout/Sidebar.tsx
import { Fragment } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  HomeIcon, 
  BuildingStorefrontIcon, 
  ClipboardDocumentListIcon, 
  StarIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const navigation = [
  { name: '대시보드', href: '/', icon: HomeIcon },
  { name: '식당 관리', href: '/restaurants', icon: BuildingStorefrontIcon },
  { name: '메뉴 관리', href: '/menus', icon: ClipboardDocumentListIcon },
  { name: '추천 설정', href: '/recommendations', icon: StarIcon },
  { name: '봇 설정', href: '/bot-settings', icon: ChatBubbleLeftRightIcon },
];

const Sidebar = ({ isOpen, setIsOpen }: SidebarProps) => {
  const location = useLocation();

  return (
    <>
      {/* 모바일 사이드바 */}
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 z-50 md:hidden" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex flex-col flex-1 w-full max-w-xs bg-indigo-700">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 pt-2 -mr-12">
                    <button
                      type="button"
                      className="flex items-center justify-center w-10 h-10 ml-1 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="sr-only">사이드바 닫기</span>
                      <XMarkIcon className="w-6 h-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                  <div className="flex items-center flex-shrink-0 px-4">
                    <span className="text-xl font-bold text-white">인하런치픽 관리자</span>
                  </div>
                  <nav className="px-2 mt-5 space-y-1">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          location.pathname === item.href
                            ? 'bg-indigo-800 text-white'
                            : 'text-white hover:bg-indigo-600'
                        } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                      >
                        <item.icon
                          className="flex-shrink-0 w-6 h-6 mr-4 text-indigo-300"
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    ))}
                  </nav>
                </div>
                <div className="flex flex-shrink-0 p-4 border-t border-indigo-800">
                  <div className="flex items-center">
                    <div>
                      <img
                        className="inline-block w-10 h-10 rounded-full"
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-white">관리자</p>
                      <button onClick={() => {}} className="text-sm font-medium text-indigo-200 hover:text-white">
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="flex-shrink-0 w-14" aria-hidden="true">
              {/* 포스 포커스 트랩 */}
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* 데스크톱 사이드바 */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <div className="flex flex-col flex-1 min-h-0 bg-indigo-700">
          <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <span className="text-xl font-bold text-white">인하런치픽 관리자</span>
            </div>
            <nav className="flex-1 px-2 mt-5 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    location.pathname === item.href
                      ? 'bg-indigo-800 text-white'
                      : 'text-white hover:bg-indigo-600'
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className="flex-shrink-0 w-6 h-6 mr-3 text-indigo-300"
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex flex-shrink-0 p-4 border-t border-indigo-800">
            <div className="flex items-center">
              <div>
                <img
                  className="inline-block w-9 h-9 rounded-full"
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt=""
                />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">관리자</p>
                <button onClick={() => {}} className="text-xs font-medium text-indigo-200 hover:text-white">
                  로그아웃
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;