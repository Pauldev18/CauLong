export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'user';
  monthlyFeePaid: boolean;
  monthlyFeeAmount?: number;
}

export interface Schedule {
  id: string;
  courtName: string;
  location: string;
  playTime: string;
  playDate: string;
  createdBy: string;
  votes: Vote[];
  completed: boolean;
  shuttlecockInfo?: {
    quantity: number;
    pricePerShuttlecock: number;
    totalCost: number;
  };
}

export interface Vote {
  userId: string;
  userName: string;
  attending: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  reason: string;
  paid: boolean;
  scheduleId: string;
  isGuest?: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  performedBy: string;
  performedByName: string;
  date: string;
  category?: string;
}