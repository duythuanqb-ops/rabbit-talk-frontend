import { Metadata } from 'next';
import { DashboardLayout as DashboardLayoutComponent } from '@/features/dashboard/components/layout/DashboardLayout';

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard',
    default: 'Dashboard',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutComponent>{children}</DashboardLayoutComponent>;
}
