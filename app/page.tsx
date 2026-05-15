'use client';

import { useStore } from '@/store/useStore';
import { AuthView } from '@/components/AuthView';
import { Workspace } from '@/components/Workspace';
import dynamic from 'next/dynamic';

function AppContent() {
  const { isUnlocked } = useStore();
  return isUnlocked ? <Workspace /> : <AuthView />;
}

const AppClient = dynamic(() => Promise.resolve(AppContent), { ssr: false });

export default function Home() {
  return <AppClient />;
}
