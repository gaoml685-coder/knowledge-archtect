import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useSettingsStore = create(
  persist(
    (set) => ({
      // API Keys
      openaiApiKey: '',
      groqApiKey: '',
      elevenlabsApiKey: '',
      doubaoApiKey: '',

      // Settings
      useRealAPI: false,

      // Actions
      setOpenAIKey: (key) => set({ openaiApiKey: key }),
      setGroqKey: (key) => set({ groqApiKey: key }),
      setElevenLabsKey: (key) => set({ elevenlabsApiKey: key }),
      setDoubaoKey: (key) => set({ doubaoApiKey: key }),
      setUseRealAPI: (value) => set({ useRealAPI: value }),

      clearKeys: () => set({
        openaiApiKey: '',
        groqApiKey: '',
        elevenlabsApiKey: '',
        doubaoApiKey: '',
        useRealAPI: false
      }),
    }),
    {
      name: 'knowledge-architect-settings',
    }
  )
);

export default useSettingsStore;
