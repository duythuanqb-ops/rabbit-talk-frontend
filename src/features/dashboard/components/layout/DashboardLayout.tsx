'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import { Menu, GraduationCap } from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 lg:ml-64 relative flex flex-col min-h-screen max-w-full lg:max-w-[calc(100vw-16rem)]">
        {/* Mobile Header */}
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="lg:hidden flex items-center justify-between glass p-4 border-b border-border sticky top-0 z-30 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
        >
          <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white bg-emerald-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]"
            >
              <GraduationCap size={20} strokeWidth={1.5} />
            </motion.div>
            <span className="font-bold text-foreground tracking-tight">RibbitTalk</span>
          </Link>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 text-muted-foreground hover:bg-surface-hover rounded-lg transition-colors"
          >
            <Menu size={24} />
          </motion.button>
        </motion.div>

        <main className="flex-1 p-4 md:p-8 relative overflow-x-hidden">
          {/* Background Accent Gradient */}
          <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-br from-emerald-500/5 dark:from-emerald-500/10 via-teal-500/5 dark:via-teal-500/5 to-transparent -z-10 pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

