'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import { Menu, GraduationCap } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 relative flex flex-col min-h-screen w-full max-w-[100vw]">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between bg-white p-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={20} />
            </div>
            <span className="font-bold text-slate-900">RibbitTalk</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <main className="flex-1 p-4 md:p-8 relative overflow-x-hidden">
          {/* Background Accent Gradient */}
          <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-br from-emerald-400/20 via-lime-300/10 to-transparent -z-10 pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
