// Sistema de cores whitelabel - facilmente customizável
export const theme = {
  // Cores primárias (facilmente alteráveis para whitelabel)
  primary: {
    50: '#f0fdf4',   // Verde muito claro
    100: '#dcfce7',  // Verde claro
    200: '#bbf7d0',  // Verde médio claro
    300: '#86efac',  // Verde médio
    400: '#4ade80',  // Verde principal
    500: '#22c55e',  // Verde forte
    600: '#16a34a',  // Verde escuro
    700: '#15803d',  // Verde muito escuro
    800: '#166534',  // Verde profundo
    900: '#14532d',  // Verde mais escuro
  },

  // Tons de cinza (base neutra)
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Cores de status
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Gradientes
  gradients: {
    primary: 'from-gray-900 via-gray-800 to-gray-900',
    card: 'from-gray-800 to-gray-900',
    button: 'from-green-600 to-green-700',
    buttonHover: 'from-green-500 to-green-600',
    game: 'from-gray-700 to-gray-800',
  },

  // Bordas
  borders: {
    primary: 'border-green-500',
    secondary: 'border-gray-600',
    light: 'border-gray-700',
  },

  // Backgrounds
  backgrounds: {
    primary: 'bg-gray-900',
    secondary: 'bg-gray-800',
    card: 'bg-gray-800/50',
    overlay: 'bg-black/50',
  },

  // Textos
  text: {
    primary: 'text-white',
    secondary: 'text-gray-300',
    muted: 'text-gray-400',
    accent: 'text-green-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  },
};

// Função para gerar CSS customizado para whitelabel
export const generateWhitelabelCSS = (customColors) => {
  const colors = { ...theme, ...customColors };
  
  return `
    :root {
      --primary-50: ${colors.primary[50]};
      --primary-100: ${colors.primary[100]};
      --primary-200: ${colors.primary[200]};
      --primary-300: ${colors.primary[300]};
      --primary-400: ${colors.primary[400]};
      --primary-500: ${colors.primary[500]};
      --primary-600: ${colors.primary[600]};
      --primary-700: ${colors.primary[700]};
      --primary-800: ${colors.primary[800]};
      --primary-900: ${colors.primary[900]};
    }
  `;
};

