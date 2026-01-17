import type { Config } from 'tailwindcss'

const config: Config = {
	darkMode: 'class',
	content: [
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				brand: {
					black: '#000000',
					white: '#ffffff',
					blue: '#3b82f6',
					'blue-light': '#60a5fa',
					'blue-dark': '#2563eb',
					orange: '#f97316',
					'orange-light': '#fb923c',
					'orange-dark': '#ea580c'
				},
				dark: {
					'50': '#f8fafc',
					'100': '#f1f5f9',
					'200': '#e2e8f0',
					'300': '#cbd5e1',
					'400': '#94a3b8',
					'500': '#64748b',
					'600': '#475569',
					'700': '#334155',
					'800': '#1e293b',
					'900': '#0f172a',
					'950': '#020617'
				},
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				chart: {
					'1': 'var(--chart-1)',
					'2': 'var(--chart-2)',
					'3': 'var(--chart-3)',
					'4': 'var(--chart-4)',
					'5': 'var(--chart-5)'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				orchid: {
					black: '#0a0a0a',
					gray: '#1a1a1a',
					border: 'rgba(255, 255, 255, 0.1)',
					glow: 'rgba(59, 130, 246, 0.15)'
				}
			},
			fontFamily: {
				sans: [
					'var(--font-geist-sans)',
					'system-ui',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI"',
					'Roboto',
					'Helvetica Neue"',
					'Arial',
					'sans-serif'
				],
				body: [
					'var(--font-geist-sans)',
					'system-ui',
					'-apple-system',
					'sans-serif'
				],
				mono: [
					'var(--font-jetbrains)',
					'monospace'
				]
			},
			animation: {
				gradient: 'gradient 8s linear infinite',
				'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'float': 'float 6s ease-in-out infinite',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'slide-up': 'slide-up 0.5s ease-out forwards'
			},
			keyframes: {
				gradient: {
					'0%, 100%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					}
				},
				float: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				}
			},
			borderRadius: {
				lg: '4px',
				md: '2px',
				sm: '1px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
}
export default config
