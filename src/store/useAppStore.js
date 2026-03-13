import { create } from 'zustand';

const useAppStore = create((set) => ({
  // Preview area view state: 'empty' | 'outline' | 'render'
  viewState: 'empty',
  setViewState: (state) => set({ viewState: state }),

  // Uploaded files
  uploadedFiles: [],
  addFile: (file) => set((state) => ({
    uploadedFiles: [...state.uploadedFiles, file]
  })),
  removeFile: (fileId) => set((state) => ({
    uploadedFiles: state.uploadedFiles.filter(f => f.id !== fileId)
  })),
  clearFiles: () => set({ uploadedFiles: [] }),

  // Chat messages
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  clearMessages: () => set({ messages: [] }),

  // PPT slides data (JSON format)
  slides: [],
  setSlides: (slides) => set({ slides }),
  updateSlide: (index, slideData) => set((state) => {
    const newSlides = [...state.slides];
    newSlides[index] = { ...newSlides[index], ...slideData };
    return { slides: newSlides };
  }),
  addSlide: (slide) => set((state) => ({
    slides: [...state.slides, slide]
  })),
  deleteSlide: (index) => set((state) => ({
    slides: state.slides.filter((_, i) => i !== index)
  })),

  // Outline data
  outline: null,
  setOutline: (outline) => set({ outline }),
}));

export default useAppStore;
