/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        primary: {
          blue: '#3B82F6',
          purple: '#8B5CF6',
          green: '#10B981',
          red: '#EF4444',
          orange: '#F97316',
          pink: '#EC4899',
        },
        // Tema renkleri
        theme: {
          'bg-primary': 'var(--bg-primary)',
          'bg-secondary': 'var(--bg-secondary)',
          'bg-tertiary': 'var(--bg-tertiary)',
          'text-primary': 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          'text-muted': 'var(--text-muted)',
          'border-primary': 'var(--border-primary)',
          'border-secondary': 'var(--border-secondary)',
          'accent-primary': 'var(--accent-primary)',
          'accent-secondary': 'var(--accent-secondary)',
        },
        // Açık tema renkleri
        light: {
          'bg-primary': '#ffffff',
          'bg-secondary': '#f8fafc',
          'bg-tertiary': '#f1f5f9',
          'text-primary': '#1e293b',
          'text-secondary': '#475569',
          'text-muted': '#64748b',
          'border-primary': '#e2e8f0',
          'border-secondary': '#cbd5e1',
          'accent-primary': '#3b82f6',
          'accent-secondary': '#1d4ed8',
        },
        // Koyu tema renkleri
        dark: {
          'bg-primary': '#0f172a',
          'bg-secondary': '#1e293b',
          'bg-tertiary': '#334155',
          'text-primary': '#f8fafc',
          'text-secondary': '#cbd5e1',
          'text-muted': '#94a3b8',
          'border-primary': '#334155',
          'border-secondary': '#475569',
          'accent-primary': '#60a5fa',
          'accent-secondary': '#3b82f6',
        },
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      },
      backgroundColor: {
        'theme-primary': 'var(--bg-primary)',
        'theme-secondary': 'var(--bg-secondary)',
        'theme-tertiary': 'var(--bg-tertiary)',
      },
      textColor: {
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-muted': 'var(--text-muted)',
      },
      borderColor: {
        'theme-primary': 'var(--border-primary)',
        'theme-secondary': 'var(--border-secondary)',
      },
    },
  },
  plugins: [],
}
