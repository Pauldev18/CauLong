import React, { useState } from 'react';
import { LogOut, Calendar, Users, CreditCard, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ScheduleForm from './ScheduleForm';
import ScheduleList from './ScheduleList';
import UserManagement from './UserManagement';
import PaymentTab from './PaymentTab';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState('schedules');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  
  const { currentUser } = state;

  const handleLogout = () => {
    dispatch({ type: 'SET_CURRENT_USER', payload: null });
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Cầu Lông Club
              </h1>
              <p className="text-sm text-gray-600">
                Chào mừng, {currentUser?.name} ({isAdmin ? 'Admin' : 'Thành viên'})
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                activeTab === 'schedules'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Lịch chơi</span>
              <span className="sm:hidden">Lịch</span>
            </button>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === 'users'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Quản lý thành viên</span>
                <span className="sm:hidden">Thành viên</span>
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('payments')}
              className={`py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                activeTab === 'payments'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Thanh toán</span>
              <span className="sm:hidden">Thanh toán</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'schedules' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Lịch chơi cầu lông
              </h2>
              {isAdmin && (
                <button
                  onClick={() => setShowScheduleForm(true)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Tạo lịch mới
                </button>
              )}
            </div>
            
            {showScheduleForm && isAdmin && (
              <ScheduleForm
                onClose={() => setShowScheduleForm(false)}
              />
            )}
            
            <ScheduleList />
          </div>
        )}
        
        {activeTab === 'users' && isAdmin && <UserManagement />}
        
        {activeTab === 'payments' && <PaymentTab />}
      </main>
    </div>
  );
}