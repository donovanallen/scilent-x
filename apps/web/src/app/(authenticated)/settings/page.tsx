import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <div className='container flex flex-col items-center justify-center h-full gap-4'>
      <h4>Settings</h4>
    </div>
  );
}
