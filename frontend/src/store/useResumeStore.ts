'use client';

import { create } from 'zustand';

export type OnboardingStep = 'upload' | 'extraction' | 'template' | 'alignment';
export type Template = 'clean' | 'modern' | 'compact';
export type SettingsTab = 'ai-models' | 'account';
export type EditStatus = 'pending' | 'accepted' | 'reverted';

export interface EditCard {
  id: string;
  status: EditStatus;
}

interface ResumeStore {
  // Onboarding
  onboardingStep: OnboardingStep;
  setOnboardingStep: (step: OnboardingStep) => void;

  // Template
  selectedTemplate: Template;
  setSelectedTemplate: (template: Template) => void;

  // Canvas
  showVersionHistory: boolean;
  toggleVersionHistory: () => void;

  // Settings
  settingsTab: SettingsTab;
  setSettingsTab: (tab: SettingsTab) => void;

  // Resume name
  resumeName: string;
  setResumeName: (name: string) => void;

  // Edit cards — tracked individually so canvas renders per-edit state
  editCards: EditCard[];
  acceptEdit: (id: string) => void;
  revertEdit: (id: string) => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  onboardingStep: 'upload',
  setOnboardingStep: (step) => set({ onboardingStep: step }),

  selectedTemplate: 'modern',
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  showVersionHistory: false,
  toggleVersionHistory: () =>
    set((state) => ({ showVersionHistory: !state.showVersionHistory })),

  settingsTab: 'ai-models',
  setSettingsTab: (tab) => set({ settingsTab: tab }),

  resumeName: 'Stripe PM v2',
  setResumeName: (name) => set({ resumeName: name }),

  editCards: [
    { id: 'edit-1', status: 'pending' },
    { id: 'edit-2', status: 'pending' },
  ],
  acceptEdit: (id) =>
    set((state) => ({
      editCards: state.editCards.map((e) =>
        e.id === id ? { ...e, status: 'accepted' } : e
      ),
    })),
  revertEdit: (id) =>
    set((state) => ({
      editCards: state.editCards.map((e) =>
        e.id === id ? { ...e, status: 'reverted' } : e
      ),
    })),
}));
