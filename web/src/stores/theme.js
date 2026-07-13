import { defineStore } from 'pinia'

const STORAGE_KEY = 'coco-theme-v1'

function loadTheme() {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    return v === 'light' || v === 'dark' ? v : 'dark'
  } catch {
    return 'dark'
  }
}

function applyTheme(theme) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    theme: loadTheme(),
  }),
  actions: {
    init() {
      applyTheme(this.theme)
    },
    toggle() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(STORAGE_KEY, this.theme)
      } catch {}
      applyTheme(this.theme)
    },
  },
})
