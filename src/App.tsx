import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { state } = useApp();
  
  return (
    <>
      {state.currentUser ? <Dashboard /> : <LoginForm />}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;