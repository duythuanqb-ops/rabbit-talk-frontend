import { Metadata } from 'next';
import SettingsPage from '@/features/settings/views/SettingsPage';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function Page() {
  return <SettingsPage />;
}
