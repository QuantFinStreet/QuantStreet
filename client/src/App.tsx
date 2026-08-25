import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './data/DataContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import InvestmentAnalysis from './pages/InvestmentAnalysis';
import LoanCalculator from './pages/LoanCalculator';
import AIChat from './pages/AIChat';

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="investments" element={<InvestmentAnalysis />} />
              <Route path="loans" element={<LoanCalculator />} />
              <Route path="chat" element={<AIChat />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 12,
              fontSize: '0.85rem',
              boxShadow: 'var(--shadow-gold)',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: 'transparent' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: 'transparent' },
            },
          }}
        />
      </DataProvider>
    </ThemeProvider>
  );
}
