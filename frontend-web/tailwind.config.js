/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7f0',   
          100: '#feeee0',  
          200: '#fcd8b5', 
          300: '#f8c088', 
          400: '#e6a861', 
          500: '#d6a861', 
          600: '#bc7404', 
          700: '#844c2c', 
          800: '#6a2202',
          900: '#4a1801', 
          950: '#2d0f00',
        },
        
        secondary: {
          50: '#f9f5f2',
          100: '#f1e8e0',
          200: '#e6d4c7', 
          300: '#d6bcaa', 
          400: '#c4a085', 
          500: '#a67c52', 
          600: '#8B4513', 
          700: '#6d3710', 
          800: '#4f2a0c', 
          900: '#371d08',
          950: '#1f1005',
        },
        
        neutral: {
          50: '#FFFFFF', 
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#CCCCCC', 
          400: '#999999',
          500: '#757575',
          600: '#555555', 
          700: '#404040', 
          800: '#333333', 
          900: '#1a1a1a',
          950: '#000000',
        },
        
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d97706',
          600: '#b45309',
          700: '#92400e',
          800: '#78350f',
          900: '#451a03',
          950: '#292524',
        },
        
        brand: {
          maron: '#6a2202',      
          moutarde: '#bc7404',   
          moutarde2: '#d6a861',   
          maron2: '#844c2c',   
          maron3: '#d6bcaa',  
          switchBrown: '#8B4513',  
          switchTrack: '#D2B48C',
        },
        
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.1)',
          brand: 'rgba(132, 76, 44, 0.1)',    
          moutarde: 'rgba(188, 116, 4, 0.1)',
        }
      },
      
      fontFamily: {
        sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter Variable', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'monospace'],
      },
      
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
        '3xl': ['2rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.5rem', { lineHeight: '2.75rem' }],
        '5xl': ['3.25rem', { lineHeight: '3.5rem' }],
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      
      boxShadow: {
        'glow': '0 0 20px rgba(132, 76, 44, 0.3)',           
        'glow-moutarde': '0 0 20px rgba(188, 116, 4, 0.3)', 
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
        'glass': '0 8px 32px rgba(132, 76, 44, 0.2)',     
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'brand': '0 10px 20px rgba(132, 76, 44, 0.15)',   
        'brand-lg': '0 20px 25px -5px rgba(132, 76, 44, 0.2)', 
      },
      
      backdropBlur: {
        xs: '2px',
      },
      
      animation: {
        blob: 'blob 25s infinite ease-in-out',
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 20s ease infinite',
        'fade-in': 'fade-in 0.8s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'fade-in-down': 'fade-in-down 0.8s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.8s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'bounce-gentle': 'bounce-gentle 2s infinite',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'text-shimmer': 'text-shimmer 2.5s ease-in-out infinite',
        'rotate-slow': 'rotate-slow 20s linear infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
      
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1) rotate(0deg)',
          },
          '20%': {
            transform: 'translate(30px, -30px) scale(1.1) rotate(45deg)',
          },
          '40%': {
            transform: 'translate(-20px, 40px) scale(0.9) rotate(-30deg)',
          },
          '60%': {
            transform: 'translate(50px, 20px) scale(1.05) rotate(60deg)',
          },
          '80%': {
            transform: 'translate(-30px, -20px) scale(0.95) rotate(-45deg)',
          },
        },
        'gradient-y': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'center top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'center center'
          }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'position': 'right center'
          }
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '400% 400%',
            'background-position': 'left center'
          },
          '25%': {
            'background-size': '300% 300%',
            'background-position': 'right top'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
          '75%': {
            'background-size': '300% 300%',
            'background-position': 'left bottom'
          }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-in-up': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(2rem)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fade-in-down': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-2rem)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'slide-in-left': {
          '0%': { 
            opacity: '0',
            transform: 'translateX(-2rem)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'slide-in-right': {
          '0%': { 
            opacity: '0',
            transform: 'translateX(2rem)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'scale-in': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)'
          }
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-0.5rem)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-1rem)' }
        },
        'glow-pulse': {
          '0%': { 
            boxShadow: '0 0 5px rgba(132, 76, 44, 0.3)' 
          },
          '100%': { 
            boxShadow: '0 0 20px rgba(132, 76, 44, 0.6), 0 0 30px rgba(132, 76, 44, 0.3)' 
          }
        },
        'text-shimmer': {
          '0%': {
            backgroundPosition: '-200% center'
          },
          '100%': {
            backgroundPosition: '200% center'
          }
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'brand-gradient': 'linear-gradient(135deg, #844c2c, #bc7404)',         
        'brand-gradient-soft': 'linear-gradient(135deg, #d6bcaa, #d6a861)',  
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
        'shimmer-brand': 'linear-gradient(90deg, transparent, rgba(188, 116, 4, 0.4), transparent)',
      },
      
      transitionTimingFunction: {
        'bounce-soft': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      
      transformOrigin: {
        'center-safe': '50% 50%',
      }
    },
  },
  plugins: [],
};