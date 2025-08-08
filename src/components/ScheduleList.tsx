import React from 'react';
import { MapPin, Clock, Calendar, Users, Check, X, CheckCircle, Filter, Trash2, UserPlus, DollarSign, AlertCircle, Plus, Minus, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Schedule, Vote, Payment, Transaction } from '../types';

export default function ScheduleList() {
  const { state, dispatch } = useApp();
  const { schedules, currentUser, users, payments, transactions } = state;
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'upcoming' | 'completed' | 'unpaid'>('all');
  const [filterDate, setFilterDate] = React.useState('');
  const [showGuestModal, setShowGuestModal] = React.useState<string | null>(null);
  const [guestName, setGuestName] = React.useState('');
  const [showCompleteModal, setShowCompleteModal] = React.useState<string | null>(null);
  const [shuttlecockQuantity, setShuttlecockQuantity] = React.useState('');
  const [shuttlecockPrice, setShuttlecockPrice] = React.useState('15000');
  const [showFinanceModal, setShowFinanceModal] = React.useState(false);
  const [transactionType, setTransactionType] = React.useState<'income' | 'expense'>('expense');
  const [transactionAmount, setTransactionAmount] = React.useState('');
  const [transactionDescription, setTransactionDescription] = React.useState('');
  const [transactionCategory, setTransactionCategory] = React.useState('');

  const handleVote = (scheduleId: string, attending: boolean) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule || !currentUser) return;

    const existingVoteIndex = schedule.votes.findIndex(v => v.userId === currentUser.id);
    const newVotes = [...schedule.votes];

    if (existingVoteIndex >= 0) {
      newVotes[existingVoteIndex] = {
        userId: currentUser.id,
        userName: currentUser.name,
        attending,
      };
    } else {
      newVotes.push({
        userId: currentUser.id,
        userName: currentUser.name,
        attending,
      });
    }

    const updatedSchedule = { ...schedule, votes: newVotes };
    dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
  };

  const handleRemoveVote = (scheduleId: string, userId: string) => {
    if (currentUser?.role !== 'admin') return;
    
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    const updatedVotes = schedule.votes.filter(v => v.userId !== userId);
    const updatedSchedule = { ...schedule, votes: updatedVotes };
    dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
  };

  const handleAddGuest = (scheduleId: string) => {
    if (!guestName.trim()) return;
    
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;

    const newVote: Vote = {
      userId: `guest-${Date.now()}`,
      userName: `${guestName.trim()} (Khách)`,
      attending: true,
    };

    const updatedSchedule = { 
      ...schedule, 
      votes: [...schedule.votes, newVote] 
    };
    
    dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
    setGuestName('');
    setShowGuestModal(null);
  };

  const handleMarkPaymentAsPaid = (scheduleId: string, userId: string) => {
    const payment = payments.find(p => 
      p.scheduleId === scheduleId && p.userId === userId
    );
    
    if (payment) {
      const updatedPayment = { ...payment, paid: true };
      dispatch({ type: 'UPDATE_PAYMENT', payload: updatedPayment });
    }
  };

  const getPaymentStatus = (scheduleId: string, userId: string) => {
    return payments.find(p => 
      p.scheduleId === scheduleId && p.userId === userId
    );
  };

  const handleCompleteSchedule = (scheduleId: string) => {
    setShowCompleteModal(scheduleId);
  };

  const handleToggleGuestPayment = (scheduleId: string, guestUserId: string, guestName: string) => {
    if (currentUser?.role !== 'admin') return;
    
    const existingPayment = payments.find(p => 
      p.scheduleId === scheduleId && p.userId === guestUserId
    );
    
    if (existingPayment) {
      // Toggle payment status
      const updatedPayment = { ...existingPayment, paid: !existingPayment.paid };
      dispatch({ type: 'UPDATE_PAYMENT', payload: updatedPayment });
    } else {
      // Create new payment for guest
      const newPayment: Payment = {
        id: Date.now().toString() + Math.random(),
        userId: guestUserId,
        userName: guestName,
        amount: 50000,
        reason: `Phí chơi khách vãng lai - ${schedules.find(s => s.id === scheduleId)?.courtName} (${new Date(schedules.find(s => s.id === scheduleId)?.playDate || '').toLocaleDateString('vi-VN')})`,
        paid: true,
        scheduleId: scheduleId,
        isGuest: true,
      };
      
      dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
    }
  };

  const handleConfirmComplete = () => {
    if (!showCompleteModal) return;
    
    const scheduleId = showCompleteModal;
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule || !currentUser || currentUser.role !== 'admin') return;

    const quantity = parseInt(shuttlecockQuantity);
    const price = parseInt(shuttlecockPrice);
    
    if (isNaN(quantity) || quantity <= 0) {
      alert('Vui lòng nhập số lượng quả cầu hợp lệ');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      alert('Vui lòng nhập giá quả cầu hợp lệ');
      return;
    }

    // Create payments for users who attended but haven't paid monthly fee
    const attendingUsers = schedule.votes.filter(v => v.attending);
    
    attendingUsers.forEach(vote => {
      const isGuest = vote.userId.startsWith('guest-');
      
      if (isGuest) {
        // Create payment record for guest (initially unpaid)
        const existingGuestPayment = payments.find(p => 
          p.userId === vote.userId && p.scheduleId === scheduleId
        );
        
        if (!existingGuestPayment) {
          const guestPayment: Payment = {
            id: Date.now().toString() + Math.random(),
            userId: vote.userId,
            userName: vote.userName,
            amount: 50000,
            reason: `Phí chơi khách vãng lai - ${schedule.courtName} (${new Date(schedule.playDate).toLocaleDateString('vi-VN')})`,
            paid: false,
            scheduleId: scheduleId,
            isGuest: true,
          };
          
          dispatch({ type: 'ADD_PAYMENT', payload: guestPayment });
        }
      } else {
        const user = users.find(u => u.id === vote.userId);
        if (user && !user.monthlyFeePaid) {
          const existingPayment = payments.find(p => 
            p.userId === user.id && p.scheduleId === scheduleId
          );
          
          if (!existingPayment) {
            const newPayment: Payment = {
              id: Date.now().toString() + Math.random(),
              userId: user.id,
              userName: user.name,
              amount: 50000,
              reason: `Chưa đóng quỹ tháng - ${schedule.courtName} (${new Date(schedule.playDate).toLocaleDateString('vi-VN')})`,
              paid: false,
              scheduleId: scheduleId,
            };
            
            dispatch({ type: 'ADD_PAYMENT', payload: newPayment });
          }
        }
      }
    });

    // Add transaction for shuttlecock expense
    const shuttlecockTransaction: Transaction = {
      id: Date.now().toString() + Math.random(),
      type: 'expense',
      amount: quantity * price,
      description: `Mua quả cầu cho ${schedule.courtName} - ${new Date(schedule.playDate).toLocaleDateString('vi-VN')} (${quantity} quả x ${price.toLocaleString('vi-VN')}đ)`,
      performedBy: currentUser.id,
      performedByName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      category: 'Quả cầu',
    };
    
    dispatch({ type: 'ADD_TRANSACTION', payload: shuttlecockTransaction });
    const updatedSchedule = { 
      ...schedule, 
      completed: true,
      shuttlecockInfo: {
        quantity,
        pricePerShuttlecock: price,
        totalCost: quantity * price
      }
    };
    dispatch({ type: 'UPDATE_SCHEDULE', payload: updatedSchedule });
    
    // Reset form and close modal
    setShowCompleteModal(null);
    setShuttlecockQuantity('');
    setShuttlecockPrice('15000');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getUserVote = (schedule: Schedule) => {
    if (!currentUser) return null;
    return schedule.votes.find(v => v.userId === currentUser.id);
  };

  const attendingCount = (schedule: Schedule) => {
    return schedule.votes.filter(v => v.attending).length;
  };

  const handleAddTransaction = () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    
    const amount = parseInt(transactionAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Vui lòng nhập số tiền hợp lệ');
      return;
    }
    
    if (!transactionDescription.trim()) {
      alert('Vui lòng nhập nội dung giao dịch');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString() + Math.random(),
      type: transactionType,
      amount,
      description: transactionDescription.trim(),
      performedBy: currentUser.id,
      performedByName: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      category: transactionCategory.trim() || undefined,
    };
    
    dispatch({ type: 'ADD_TRANSACTION', payload: newTransaction });
    
    // Reset form and close modal
    setTransactionAmount('');
    setTransactionDescription('');
    setTransactionCategory('');
    setTransactionType('expense');
    setShowFinanceModal(false);
  };

  const hasUnpaidPayments = (schedule: Schedule) => {
    if (!schedule.completed) return false;
    
    const attendingUsers = schedule.votes.filter(v => v.attending && !v.userId.startsWith('guest-'));
    return attendingUsers.some(vote => {
      const user = users.find(u => u.id === vote.userId);
      if (user && !user.monthlyFeePaid) {
        const payment = payments.find(p => p.userId === vote.userId && p.scheduleId === schedule.id);
        return payment && !payment.paid;
      }
      return false;
    });
  };
  const filteredSchedules = schedules.filter(schedule => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'upcoming') return !schedule.completed;
    if (filterStatus === 'completed') return schedule.completed;
    if (filterStatus === 'unpaid') return hasUnpaidPayments(schedule);
    return true;
  }).filter(schedule => {
    if (!filterDate) return true;
    return schedule.playDate === filterDate;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Lọc lịch chơi</h3>
        </div>
        
        {/* Status Filter */}
        <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg mb-4">
          <button
            onClick={() => setFilterStatus('all')}
            className={`py-2 px-2 sm:px-4 rounded-md font-medium text-xs sm:text-sm transition text-center ${
              filterStatus === 'all'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="hidden sm:inline">Tất cả ({schedules.length})</span>
            <span className="sm:hidden">Tất cả</span>
          </button>
          <button
            onClick={() => setFilterStatus('upcoming')}
            className={`py-2 px-2 sm:px-4 rounded-md font-medium text-xs sm:text-sm transition text-center ${
              filterStatus === 'upcoming'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="hidden sm:inline">Sắp tới ({schedules.filter(s => !s.completed).length})</span>
            <span className="sm:hidden">Sắp tới</span>
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`py-2 px-2 sm:px-4 rounded-md font-medium text-xs sm:text-sm transition text-center ${
              filterStatus === 'completed'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <span className="hidden sm:inline">Đã hoàn thành ({schedules.filter(s => s.completed).length})</span>
            <span className="sm:hidden">Hoàn thành</span>
          </button>
        </div>
        
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc theo ngày chơi
          </label>
          <div className="relative w-full sm:max-w-xs">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
            />
          </div>
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="mt-2 text-sm text-green-600 hover:text-green-800"
            >
              Xóa bộ lọc ngày
            </button>
          )}
        </div>
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {filterStatus === 'all' && 'Chưa có lịch chơi nào'}
            {filterStatus === 'upcoming' && 'Không có lịch chơi sắp tới'}
            {filterStatus === 'completed' && 'Không có lịch chơi đã hoàn thành'}
          </p>
        </div>
      ) : (
        filteredSchedules.map((schedule) => (
          <div key={schedule.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-3 sm:gap-0">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {schedule.courtName}
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 text-sm sm:text-base">
                      <MapPin className="w-4 h-4 mr-2" />
                      {schedule.location}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm sm:text-base">
                      <Clock className="w-4 h-4 mr-2" />
                      {schedule.playTime}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm sm:text-base">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(schedule.playDate)}
                    </div>
                  </div>
                </div>
                
                <div className="text-left sm:text-right">
                  {schedule.completed && (
                    <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm bg-green-100 text-green-800 mb-2">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Đã hoàn thành</span>
                      <span className="sm:hidden">Hoàn thành</span>
                    </span>
                  )}
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="w-4 h-4 mr-1" />
                    {attendingCount(schedule)} người tham gia
                  </div>
                </div>
              </div>

              {/* Voting Section */}
              {!schedule.completed && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Bạn có tham gia không?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={() => handleVote(schedule.id, true)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition text-sm sm:text-base font-medium ${
                        getUserVote(schedule)?.attending === true
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      Có tham gia
                    </button>
                    <button
                      onClick={() => handleVote(schedule.id, false)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition text-sm sm:text-base font-medium ${
                        getUserVote(schedule)?.attending === false
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <X className="w-4 h-4" />
                      Không tham gia
                    </button>
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => setShowGuestModal(schedule.id)}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm sm:text-base font-medium"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Thêm khách</span>
                        <span className="sm:hidden">Khách</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Participants List */}
              {schedule.votes.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Danh sách tham gia:
                  </p>
                  <div className="space-y-2">
                    {schedule.votes.map((vote, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between group gap-2 sm:gap-0 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-sm text-gray-600">{vote.userName}</span>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {schedule.completed && vote.attending && (
                              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                                {(() => {
                                  const user = users.find(u => u.id === vote.userId);
                                  const isGuest = vote.userId.startsWith('guest-');
                                  if (isGuest) {
                                    return '50,000đ (Khách)';
                                  } else if (user?.monthlyFeePaid) {
                                    return '0đ (Quỹ tháng)';
                                  } else {
                                    return '50,000đ (Theo buổi)';
                                  }
                                })()}
                              </span>
                            )}
                            {schedule.completed && vote.attending && (
                              (() => {
                                const isGuest = vote.userId.startsWith('guest-');
                                
                                if (isGuest) {
                                  const payment = getPaymentStatus(schedule.id, vote.userId);
                                  return (
                                    <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                      payment?.paid 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {payment?.paid ? (
                                        <>
                                          <CheckCircle className="w-3 h-3" />
                                          <span className="hidden sm:inline">Đã thanh toán</span>
                                          <span className="sm:hidden">Đã trả</span>
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-3 h-3" />
                                          <span className="hidden sm:inline">Chưa thanh toán</span>
                                          <span className="sm:hidden">Chưa trả</span>
                                        </>
                                      )}
                                    </span>
                                  );
                                } else {
                                  const user = users.find(u => u.id === vote.userId);
                                  
                                  if (user?.monthlyFeePaid) {
                                    return (
                                      <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3" />
                                        <span className="hidden sm:inline">Đã thanh toán</span>
                                        <span className="sm:hidden">Đã trả</span>
                                      </span>
                                    );
                                  } else if (user) {
                                    const payment = getPaymentStatus(schedule.id, vote.userId);
                                    return (
                                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                                        payment?.paid 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {payment?.paid ? (
                                          <>
                                            <CheckCircle className="w-3 h-3" />
                                            <span className="hidden sm:inline">Đã thanh toán</span>
                                            <span className="sm:hidden">Đã trả</span>
                                          </>
                                        ) : (
                                          <>
                                            <AlertCircle className="w-3 h-3" />
                                            <span className="hidden sm:inline">Chưa thanh toán</span>
                                            <span className="sm:hidden">Chưa trả</span>
                                          </>
                                        )}
                                      </span>
                                    );
                                  }
                                }
                                return null;
                              })()
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                          <span className={`flex items-center text-xs px-2 py-1 rounded-full ${
                            vote.attending 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {vote.attending ? (
                              <>
                                <Check className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Tham gia</span>
                                <span className="sm:hidden">Có</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 mr-1" />
                                <span className="hidden sm:inline">Không tham gia</span>
                                <span className="sm:hidden">Không</span>
                              </>
                            )}
                          </span>
                          {schedule.completed && vote.attending && currentUser?.role === 'admin' && (
                            (() => {
                              const isGuest = vote.userId.startsWith('guest-');
                              const payment = getPaymentStatus(schedule.id, vote.userId);
                              
                              if (isGuest) {
                                // Guest payment toggle button
                                return (
                                  <button
                                    onClick={() => handleToggleGuestPayment(schedule.id, vote.userId, vote.userName)}
                                    className={`px-2 py-1 rounded text-xs transition flex items-center gap-1 whitespace-nowrap ${
                                      payment?.paid 
                                        ? 'bg-orange-500 text-white hover:bg-orange-600' 
                                        : 'bg-green-500 text-white hover:bg-green-600'
                                    }`}
                                    title={payment?.paid ? "Đánh dấu chưa thanh toán" : "Đánh dấu đã thanh toán"}
                                  >
                                    <DollarSign className="w-3 h-3" />
                                    {payment?.paid ? 'Chưa trả' : 'Đã trả'}
                                  </button>
                                );
                              } else {
                                // Regular user payment button
                                const user = users.find(u => u.id === vote.userId);
                                
                                if (user && !user.monthlyFeePaid && payment && !payment.paid) {
                                  return (
                                    <button
                                      onClick={() => handleMarkPaymentAsPaid(schedule.id, vote.userId)}
                                      className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition flex items-center gap-1 whitespace-nowrap"
                                      title="Đánh dấu đã thanh toán"
                                    >
                                      <DollarSign className="w-3 h-3" />
                                      Đã trả
                                    </button>
                                  );
                                }
                              }
                              return null;
                            })()
                          )}
                          {schedule.completed && vote.attending && !currentUser?.role !== 'admin' && vote.userId === currentUser?.id && (
                            (() => {
                              const user = users.find(u => u.id === vote.userId);
                              const payment = getPaymentStatus(schedule.id, vote.userId);
                              
                              if (user && !user.monthlyFeePaid && payment && !payment.paid) {
                                return (
                                  <button
                                    onClick={() => handleMarkPaymentAsPaid(schedule.id, vote.userId)}
                                    className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition flex items-center gap-1 whitespace-nowrap"
                                    title="Đánh dấu đã thanh toán"
                                  >
                                    <DollarSign className="w-3 h-3" />
                                    Đã trả
                                  </button>
                                );
                              }
                              return null;
                            })()
                          )}
                          {currentUser?.role === 'admin' && !schedule.completed && (
                            <button
                              onClick={() => handleRemoveVote(schedule.id, vote.userId)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-50 rounded transition-all"
                              title="Hủy vote của thành viên"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Complete Button */}
              {!schedule.completed && currentUser?.role === 'admin' && schedule.votes.some(v => v.attending) && (
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => setShowCompleteModal(schedule.id)}
                    className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 text-sm sm:text-base font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Hoàn thành lịch chơi
                  </button>
                </div>
              )}

              {/* Shuttlecock Info Display */}
              {schedule.completed && schedule.shuttlecockInfo && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin quả cầu:</h4>
                  <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Số lượng:</span>
                        <p className="font-medium">{schedule.shuttlecockInfo.quantity} quả</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Giá/quả:</span>
                        <p className="font-medium">{schedule.shuttlecockInfo.pricePerShuttlecock.toLocaleString('vi-VN')}đ</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Tổng tiền:</span>
                        <p className="font-medium text-blue-600">{schedule.shuttlecockInfo.totalCost.toLocaleString('vi-VN')}đ</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      )}

      {/* Complete Schedule Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-2 sm:mx-0">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Hoàn thành lịch chơi</h3>
              <button
                onClick={() => {
                  setShowCompleteModal(null);
                  setShuttlecockQuantity('');
                  setShuttlecockPrice('15000');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng quả cầu đã sử dụng
                </label>
                <input
                  type="number"
                  value={shuttlecockQuantity}
                  onChange={(e) => setShuttlecockQuantity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Nhập số lượng quả cầu"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá 1 quả cầu (VNĐ)
                </label>
                <input
                  type="number"
                  value={shuttlecockPrice}
                  onChange={(e) => setShuttlecockPrice(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Nhập giá 1 quả cầu"
                  min="1000"
                  step="1000"
                  required
                />
              </div>

              {shuttlecockQuantity && shuttlecockPrice && !isNaN(parseInt(shuttlecockQuantity)) && !isNaN(parseInt(shuttlecockPrice)) && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Tổng chi phí quả cầu:</p>
                  <p className="text-lg font-semibold text-green-600">
                    {(parseInt(shuttlecockQuantity) * parseInt(shuttlecockPrice)).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(null);
                    setShuttlecockQuantity('');
                    setShuttlecockPrice('15000');
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-base font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmComplete}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2 text-base font-medium"
                >
                  <CheckCircle className="w-4 h-4" />
                  Hoàn thành
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-2 sm:mx-0">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Thêm khách vãng lai</h3>
              <button
                onClick={() => {
                  setShowGuestModal(null);
                  setGuestName('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khách vãng lai
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Nhập tên khách vãng lai"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddGuest(showGuestModal);
                    }
                  }}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Khách vãng lai sẽ được đánh dấu tự động là "Có tham gia"
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowGuestModal(null);
                    setGuestName('');
                  }}
                  className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-base font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleAddGuest(showGuestModal)}
                  disabled={!guestName.trim()}
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm khách
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finance Management Modal */}
      {showFinanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Quản lý thu chi</h3>
              <button
                onClick={() => {
                  setShowFinanceModal(false);
                  setTransactionAmount('');
                  setTransactionDescription('');
                  setTransactionCategory('');
                  setTransactionType('expense');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại giao dịch
                </label>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setTransactionType('expense')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition flex items-center justify-center gap-2 ${
                      transactionType === 'expense'
                        ? 'bg-white text-red-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Minus className="w-4 h-4" />
                    Chi
                  </button>
                  <button
                    onClick={() => setTransactionType('income')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition flex items-center justify-center gap-2 ${
                      transactionType === 'income'
                        ? 'bg-white text-green-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    Thu
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số tiền (VNĐ)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập số tiền"
                    min="1000"
                    step="1000"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung giao dịch
                </label>
                <textarea
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về giao dịch"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục (tùy chọn)
                </label>
                <input
                  type="text"
                  value={transactionCategory}
                  onChange={(e) => setTransactionCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="VD: Quả cầu, Thuê sân, Quỹ tháng..."
                />
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Người thực hiện:</p>
                <p className="font-medium text-gray-900">{currentUser?.name}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowFinanceModal(false);
                    setTransactionAmount('');
                    setTransactionDescription('');
                    setTransactionCategory('');
                    setTransactionType('expense');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAddTransaction}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm giao dịch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}