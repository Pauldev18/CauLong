import React from 'react';
import { CreditCard, CheckCircle, AlertCircle, DollarSign, RotateCcw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PaymentTab() {
  const { state, dispatch } = useApp();
  const { payments, currentUser } = state;
  
  const isAdmin = currentUser?.role === 'admin';
  const userPayments = isAdmin 
    ? payments 
    : payments.filter(p => p.userId === currentUser?.id);

  const handleMarkAsPaid = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      const updatedPayment = { ...payment, paid: true };
      dispatch({ type: 'UPDATE_PAYMENT', payload: updatedPayment });
    }
  };

  const handleMarkAsUnpaid = (paymentId: string) => {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
      const updatedPayment = { ...payment, paid: false };
      dispatch({ type: 'UPDATE_PAYMENT', payload: updatedPayment });
    }
  };

  const totalUnpaid = userPayments
    .filter(p => !p.paid)
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = userPayments
    .filter(p => p.paid)
    .reduce((sum, p) => sum + p.amount, 0);

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
          {isAdmin ? 'Quản lý thanh toán' : 'Thanh toán của tôi'}
        </h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cần thanh toán</p>
              <p className="text-xl sm:text-2xl font-semibold text-red-600">
                {formatCurrency(totalUnpaid)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
              <p className="text-xl sm:text-2xl font-semibold text-green-600">
                {formatCurrency(totalPaid)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 sm:p-6 border-b">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            {isAdmin ? 'Tất cả thanh toán' : 'Danh sách thanh toán'}
          </h3>
        </div>
        
        <div className="p-4 sm:p-6">
          {userPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">
                {isAdmin ? 'Chưa có thanh toán nào' : 'Bạn không có khoản thanh toán nào'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {userPayments.map((payment) => (
                <div key={payment.id} className={`p-3 sm:p-4 rounded-lg border-2 ${
                  payment.paid 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
                    <div className="flex-1">
                      {isAdmin && (
                        <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                          {payment.userName}
                        </h4>
                      )}
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
                        {payment.reason}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center text-gray-700">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span className="font-medium text-sm sm:text-base">
                            {formatCurrency(payment.amount)}
                          </span>
                        </div>
                        <div className={`flex items-center text-sm ${
                          payment.paid ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {payment.paid ? (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          ) : (
                            <AlertCircle className="w-4 h-4 mr-1" />
                          )}
                          {payment.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 sm:ml-4">
                      {!payment.paid ? (
                        <button
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-xs sm:text-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">{isAdmin ? 'Đánh dấu đã trả' : 'Đã thanh toán'}</span>
                          <span className="sm:hidden">Đã trả</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsUnpaid(payment.id)}
                          className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-xs sm:text-sm font-medium flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span className="hidden sm:inline">Đánh dấu chưa trả</span>
                          <span className="sm:hidden">Chưa trả</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}