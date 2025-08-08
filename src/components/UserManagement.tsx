import React, { useState } from 'react';
import { Users, DollarSign, Check, X, Plus, Trash2, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UserManagement() {
  const { state, dispatch } = useApp();
  const { users } = state;
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [feeAmount, setFeeAmount] = useState('50000');

  // Thành viên đã đóng quỹ tháng (chơi miễn phí)
  const monthlyFeeMembers = users.filter(u => u.monthlyFeePaid && u.role !== 'admin');
  
  // Thành viên câu lạc bộ (chưa đóng quỹ tháng, trả tiền theo buổi)
  const clubMembers = users.filter(u => !u.monthlyFeePaid && u.role !== 'admin');

  const removeFromMonthlyFee = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const updatedUser = { 
        ...user, 
        monthlyFeePaid: false,
        monthlyFeeAmount: undefined
      };
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    }
  };

  const handleAddToMonthlyFee = () => {
    const amount = parseInt(feeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }

    selectedUsers.forEach(userId => {
      const user = users.find(u => u.id === userId);
      if (user && !user.monthlyFeePaid) {
        const updatedUser = { 
          ...user, 
          monthlyFeePaid: true,
          monthlyFeeAmount: amount
        };
        dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      }
    });

    setSelectedUsers([]);
    setShowAddModal(false);
    setFeeAmount('50000');
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.role !== 'admin') {
      if (confirm(`Bạn có chắc chắn muốn xóa thành viên ${user.name} khỏi câu lạc bộ?`)) {
        const updatedUsers = users.filter(u => u.id !== userId);
        dispatch({ type: 'LOAD_DATA', payload: { ...state, users: updatedUsers } });
      }
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Quản lý thành viên
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng thành viên</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{users.filter(u => u.role !== 'admin').length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đóng quỹ tháng</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{monthlyFeeMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trả theo buổi</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{clubMembers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Fee Members */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              Thành viên đóng quỹ tháng ({monthlyFeeMembers.length})
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Thêm vào quỹ tháng</span>
              <span className="sm:hidden">Thêm quỹ tháng</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Các thành viên đã đóng phí cố định hàng tháng, chơi miễn phí
          </p>
        </div>
        <div className="p-4 sm:p-6">
          {monthlyFeeMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Chưa có thành viên nào đóng quỹ tháng
            </p>
          ) : (
            <div className="space-y-4">
              {monthlyFeeMembers.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 gap-3 sm:gap-0">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Check className="w-3 h-3 mr-1" />
                        Quỹ tháng: {formatCurrency(user.monthlyFeeAmount || 0)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      onClick={() => removeFromMonthlyFee(user.id)}
                      className="px-3 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg text-xs sm:text-sm font-medium transition text-center"
                    >
                      <span className="hidden sm:inline">Chuyển sang trả theo buổi</span>
                      <span className="sm:hidden">Chuyển theo buổi</span>
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition self-center"
                      title="Xóa khỏi câu lạc bộ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Club Members (Pay per session) */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 sm:p-6 border-b">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            Thành viên câu lạc bộ ({clubMembers.length})
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            Các thành viên chưa đóng quỹ tháng, phải thanh toán theo từng buổi chơi
          </p>
        </div>
        <div className="p-4 sm:p-6">
          {clubMembers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Tất cả thành viên đều đã đóng quỹ tháng
            </p>
          ) : (
            <div className="space-y-4">
              {clubMembers.map((user) => (
                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-orange-50 rounded-lg border border-orange-200 gap-3 sm:gap-0">
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base">{user.name}</h4>
                    <p className="text-sm text-gray-600">{user.phone}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <DollarSign className="w-3 h-3 mr-1" />
                        Trả theo buổi: 50,000đ/lần
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Xóa khỏi câu lạc bộ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add to Monthly Fee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-2 sm:mx-0 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Thêm vào quỹ tháng</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedUsers([]);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền đóng quỹ tháng
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={(e) => setFeeAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                    placeholder="50000"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Nhập số tiền quỹ tháng mà thành viên đã đóng
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Chọn thành viên để thêm vào danh sách đóng quỹ tháng ({clubMembers.length} người)
                </label>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {clubMembers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Tất cả thành viên đều đã đóng quỹ tháng
                    </p>
                  ) : (
                    clubMembers.map((user) => (
                      <label key={user.id} className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.phone}</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUsers([]);
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-base font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddToMonthlyFee}
                  disabled={selectedUsers.length === 0}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Thêm vào quỹ tháng ({selectedUsers.length})</span>
                  <span className="sm:hidden">Thêm ({selectedUsers.length})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}