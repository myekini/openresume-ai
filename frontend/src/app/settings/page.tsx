'use client';

import { SettingsSidebar } from '@/components/settings/SettingsSidebar';
import { AIModelsSettings } from '@/components/settings/AIModelsSettings';
import { AccountSettings } from '@/components/settings/AccountSettings';
import { useResumeStore } from '@/store/useResumeStore';

export default function SettingsPage() {
  const { settingsTab } = useResumeStore();

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Sidebar */}
      <SettingsSidebar />

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {settingsTab === 'ai-models' && <AIModelsSettings />}
        {settingsTab === 'account' && <AccountSettings />}
      </div>
    </div>
  );
}
