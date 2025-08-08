import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Schedule, Payment, Transaction } from '../types';

interface AppState {
  currentUser: User | null;
  users: User[];
  schedules: Schedule[];
  payments: Payment[];
  transactions: Transaction[];
}

type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: User | null }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'ADD_SCHEDULE'; payload: Schedule }
  | { type: 'UPDATE_SCHEDULE'; payload: Schedule }
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'LOAD_DATA'; payload: AppState };

const initialState: AppState = {
  currentUser: null,
  users: [
    {
      id: '1',
      name: 'Admin',
      phone: '0123456789',
      role: 'admin',
      monthlyFeePaid: true,
    },
    {
      id: '2',
      name: 'Nguyễn Văn A',
      phone: '0987654321',
      role: 'user',
      monthlyFeePaid: true,
      monthlyFeeAmount: 50000,
    },
    {
      id: '3',
      name: 'Trần Thị B',
      phone: '0912345678',
      role: 'user',
      monthlyFeePaid: false,
    },
    {
      id: '4',
      name: 'Lê Văn C',
      phone: '0898765432',
      role: 'user',
      monthlyFeePaid: true,
      monthlyFeeAmount: 60000,
    },
  ],
  schedules: [
    {
      id: '1',
      courtName: 'Sân ABC',
      location: 'Quận 1, TP.HCM',
      playTime: '19:00 - 21:00',
      playDate: '2025-01-15',
      createdBy: '1',
      votes: [
        { userId: '2', userName: 'Nguyễn Văn A', attending: true },
        { userId: '3', userName: 'Trần Thị B', attending: true },
      ],
      completed: true,
    },
  ],
  payments: [
    {
      id: '1',
      userId: '3',
      userName: 'Trần Thị B',
      amount: 50000,
      reason: 'Chưa đóng tiền - Sân ABC (15/01/2025)',
      paid: false,
      scheduleId: '1',
    },
  ],
  transactions: [
    {
      id: '1',
      type: 'expense',
      amount: 150000,
      description: 'Mua quả cầu cho buổi chơi ngày 15/01',
      performedBy: '1',
      performedByName: 'Admin',
      date: '2025-01-15',
      category: 'Quả cầu',
    },
  ],
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case 'ADD_SCHEDULE':
      return { ...state, schedules: [...state.schedules, action.payload] };
    case 'UPDATE_SCHEDULE':
      return {
        ...state,
        schedules: state.schedules.map(schedule => 
          schedule.id === action.payload.id ? action.payload : schedule
        ),
      };
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment => 
          payment.id === action.payload.id ? action.payload : payment
        ),
      };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [...state.transactions, action.payload] };
    case 'LOAD_DATA':
      return action.payload;
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('badmintonApp');
    if (savedData) {
      dispatch({ type: 'LOAD_DATA', payload: JSON.parse(savedData) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('badmintonApp', JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}