import React, { useState } from 'react';
import { X, Calendar, MapPin, Clock, Type } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Schedule } from '../types';

interface ScheduleFormProps {
  onClose: () => void;
}

export default function ScheduleForm({ onClose }: ScheduleFormProps) {
  const { state, dispatch } = useApp();
  const [courtName, setCourtName] = useState('');
  const [location, setLocation] = useState('');
  const [playTime, setPlayTime] = useState('');
  const [playDate, setPlayDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSchedule: Schedule = {
      id: Date.now().toString(),
      courtName,
      location,
      playTime,
      playDate,
      createdBy: state.currentUser!.id,
      votes: [],
      completed: false,
    };

    dispatch({ type: 'ADD_SCHEDULE', payload: newSchedule });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-2 sm:mx-0">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Tạo lịch chơi mới</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên sân
            </label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={courtName}
                onChange={(e) => setCourtName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                placeholder="VD: Sân ABC"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                placeholder="VD: Quận 1, TP.HCM"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giờ chơi
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={playTime}
                onChange={(e) => setPlayTime(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                placeholder="VD: 19:00 - 21:00"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày chơi
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={playDate}
                onChange={(e) => setPlayDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-base font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-base font-medium"
            >
              Tạo lịch
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}