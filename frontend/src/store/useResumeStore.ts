'use client';

import { create } from 'zustand';

export type OnboardingStep = 'upload' | 'extraction' | 'template' | 'alignment';
export type Template = 'clean' | 'modern' | 'compact';
export type SettingsTab = 'ai-models' | 'account';
export type EditStatus = 'pending' | 'accepted' | 'reverted';
export type MessageRole = 'ai' | 'user';

export interface EditCard {
  id: string;
  status: EditStatus;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
}

// ── Resume AST ──────────────────────────────────────
export interface ContactInfo {
  name: string;
  location?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  website?: string;
}

export interface BulletPoint {
  id: string;
  text: string;
  isAiEdited?: boolean;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  bullets: BulletPoint[];
}

export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface ResumeAST {
  contact: ContactInfo;
  summary?: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
}

// ── Default demo AST (replaces the hardcoded JSX) ───
const DEFAULT_RESUME: ResumeAST = {
  contact: {
    name: 'Your Name',
    location: 'City, Country',
    email: 'you@email.com',
    linkedin: 'linkedin.com/in/yourprofile',
  },
  experience: [
    {
      id: 'exp-1',
      company: 'Company Name',
      title: 'Your Role',
      startDate: 'Jan 2022',
      endDate: 'Present',
      bullets: [
        { id: 'b-1', text: 'Led a key initiative that drove measurable business impact.' },
        { id: 'b-2', text: 'Collaborated cross-functionally to deliver a high-impact project.' },
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'University Name',
      degree: 'B.Sc. in Your Field',
      startDate: '2018',
      endDate: '2022',
    },
  ],
  skills: ['Communication', 'Leadership', 'Data Analysis', 'Product Strategy'],
};

const INITIAL_AI_MESSAGE: ChatMessage = {
  id: 'msg-init',
  role: 'ai',
  content:
    'Upload your resume and paste a job description to get started. I\'ll analyze gaps and suggest targeted edits across your Experience section.',
};

// ── Store ────────────────────────────────────────────
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

  // ── Alignment / JD context ──
  jdText: string;
  setJdText: (text: string) => void;

  jobTitle: string;
  setJobTitle: (title: string) => void;

  company: string;
  setCompany: (company: string) => void;

  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // ── Resume AST ──
  resumeData: ResumeAST;
  setResumeData: (data: ResumeAST) => void;
  updateBullet: (expId: string, bulletId: string, newText: string) => void;

  // ── Chat messages ──
  messages: ChatMessage[];
  addMessage: (msg: Omit<ChatMessage, 'id'>) => void;
  clearMessages: () => void;
  setMessageStreaming: (id: string, isStreaming: boolean) => void;

  // Edit cards — tracked individually so canvas renders per-edit state
  editCards: EditCard[];
  acceptEdit: (id: string) => void;
  revertEdit: (id: string) => void;
}

let msgCounter = 1;
const genMsgId = () => `msg-${Date.now()}-${msgCounter++}`;

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

  resumeName: 'My Resume',
  setResumeName: (name) => set({ resumeName: name }),

  // Alignment / JD context
  jdText: '',
  setJdText: (text) => set({ jdText: text }),

  jobTitle: '',
  setJobTitle: (title) => set({ jobTitle: title }),

  company: '',
  setCompany: (company) => set({ company: company }),

  selectedModel: 'Claude 3.5 Sonnet',
  setSelectedModel: (model) => set({ selectedModel: model }),

  // Resume AST
  resumeData: DEFAULT_RESUME,
  setResumeData: (data) => set({ resumeData: data }),
  updateBullet: (expId, bulletId, newText) =>
    set((state) => ({
      resumeData: {
        ...state.resumeData,
        experience: state.resumeData.experience.map((exp) =>
          exp.id === expId
            ? {
                ...exp,
                bullets: exp.bullets.map((b) =>
                  b.id === bulletId ? { ...b, text: newText } : b
                ),
              }
            : exp
        ),
      },
    })),

  // Chat messages
  messages: [INITIAL_AI_MESSAGE],
  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, { ...msg, id: genMsgId() }],
    })),
  clearMessages: () => set({ messages: [INITIAL_AI_MESSAGE] }),
  setMessageStreaming: (id, isStreaming) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, isStreaming } : m
      ),
    })),

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
