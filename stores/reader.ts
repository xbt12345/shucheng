import { create } from 'zustand'

export type ReaderTheme = 'paper' | 'eye' | 'night'
export type HighlightColor = 'yellow' | 'red' | 'blue' | 'green'

type ReaderState = {
  fontSize: number
  theme: ReaderTheme
  currentCfi: string | null
  currentChapterId: string | null
  selectedCfi: string | null
  selectedText: string | null
  showHighlightMenu: boolean
  setFontSize: (size: number) => void
  setTheme: (theme: ReaderTheme) => void
  setCurrentCfi: (cfi: string) => void
  setCurrentChapterId: (id: string) => void
  openHighlightMenu: (cfi: string, text: string) => void
  closeHighlightMenu: () => void
}

export const useReaderStore = create<ReaderState>(set => ({
  fontSize: 18,
  theme: 'paper',
  currentCfi: null,
  currentChapterId: null,
  selectedCfi: null,
  selectedText: null,
  showHighlightMenu: false,
  setFontSize: size => set({ fontSize: size }),
  setTheme: theme => set({ theme }),
  setCurrentCfi: cfi => set({ currentCfi: cfi }),
  setCurrentChapterId: id => set({ currentChapterId: id }),
  openHighlightMenu: (cfi, text) => set({
    selectedCfi: cfi,
    selectedText: text,
    showHighlightMenu: true,
  }),
  closeHighlightMenu: () => set({
    selectedCfi: null,
    selectedText: null,
    showHighlightMenu: false,
  }),
}))
