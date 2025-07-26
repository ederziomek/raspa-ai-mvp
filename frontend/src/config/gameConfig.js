// 🎮 CONFIGURAÇÃO COMPLETA DO SISTEMA RASPAGREEN

// 💰 VALORES DE APOSTAS (17 valores)
export const BET_VALUES = [
  0.50, 1.00, 1.50, 2.00, 2.50, 3.00, 5.00, 7.00, 10.00,
  15.00, 20.00, 30.00, 50.00, 70.00, 100.00, 150.00, 200.00
];

// 🎯 MULTIPLICADORES (14 por valor de aposta)
export const MULTIPLIERS = [
  { multiplier: 0.7, probability: 25.0 },    // 25%
  { multiplier: 1.4, probability: 20.0 },    // 20%
  { multiplier: 2.0, probability: 8.0 },     // 8%
  { multiplier: 3.0, probability: 4.0 },     // 4%
  { multiplier: 4.0, probability: 1.8 },     // 1.8%
  { multiplier: 5.0, probability: 0.8 },     // 0.8%
  { multiplier: 12.0, probability: 0.25 },   // 0.25%
  { multiplier: 25.0, probability: 0.1 },    // 0.1%
  { multiplier: 70.0, probability: 0.04 },   // 0.04%
  { multiplier: 140.0, probability: 0.008 }, // 0.008%
  { multiplier: 320.0, probability: 0.0015 }, // 0.0015%
  { multiplier: 650.0, probability: 0.0004 }, // 0.0004%
  { multiplier: 1360.0, probability: 0.000099 }, // 0.000099%
  { multiplier: 5000.0, probability: 0.000001 }  // 0.000001%
];

// 🪙 MAPEAMENTO DE ÍCONES PARA VALORES
export const ICON_MAPPING = {
  // Moedas
  0.05: { icon: '/icons/moeda_5_centavos.png', name: '5 centavos' },
  0.10: { icon: '/icons/moeda_10_centavos.png', name: '10 centavos' },
  0.25: { icon: '/icons/moeda_25_centavos.png', name: '25 centavos' },
  0.50: { icon: '/icons/moeda_50_centavos.png', name: '50 centavos' },
  1.00: { icon: '/icons/moeda_1_real.png', name: 'R$ 1' },
  
  // Notas
  2.00: { icon: '/icons/nota_2_reais.png', name: 'R$ 2' },
  5.00: { icon: '/icons/nota_5_reais.png', name: 'R$ 5' },
  10.00: { icon: '/icons/nota_10_reais.png', name: 'R$ 10' },
  20.00: { icon: '/icons/nota_20_reais.png', name: 'R$ 20' },
  50.00: { icon: '/icons/nota_50_reais.png', name: 'R$ 50' },
  100.00: { icon: '/icons/nota_100_reais.png', name: 'R$ 100' },
  
  // Combinações especiais para valores altos
  150.00: { icon: '/icons/maco_notas.png', name: 'R$ 150' },
  200.00: { icon: '/icons/maco_notas.png', name: 'R$ 200' },
  300.00: { icon: '/icons/maco_notas.png', name: 'R$ 300' },
  500.00: { icon: '/icons/maco_notas.png', name: 'R$ 500' },
  1000.00: { icon: '/icons/maco_notas.png', name: 'R$ 1.000' }
};

// 🎲 FUNÇÃO PARA OBTER ÍCONE BASEADO NO VALOR
export const getIconForValue = (value) => {
  // Arredonda para 2 casas decimais para evitar problemas de ponto flutuante
  const roundedValue = Math.round(value * 100) / 100;
  
  // Verifica se existe mapeamento direto
  if (ICON_MAPPING[roundedValue]) {
    return ICON_MAPPING[roundedValue];
  }
  
  // Para valores não mapeados, usa lógica de aproximação
  if (roundedValue >= 1000) return ICON_MAPPING[1000.00];
  if (roundedValue >= 500) return ICON_MAPPING[500.00];
  if (roundedValue >= 300) return ICON_MAPPING[300.00];
  if (roundedValue >= 200) return ICON_MAPPING[200.00];
  if (roundedValue >= 150) return ICON_MAPPING[150.00];
  if (roundedValue >= 100) return ICON_MAPPING[100.00];
  if (roundedValue >= 50) return ICON_MAPPING[50.00];
  if (roundedValue >= 20) return ICON_MAPPING[20.00];
  if (roundedValue >= 10) return ICON_MAPPING[10.00];
  if (roundedValue >= 5) return ICON_MAPPING[5.00];
  if (roundedValue >= 2) return ICON_MAPPING[2.00];
  if (roundedValue >= 1) return ICON_MAPPING[1.00];
  if (roundedValue >= 0.50) return ICON_MAPPING[0.50];
  if (roundedValue >= 0.25) return ICON_MAPPING[0.25];
  if (roundedValue >= 0.10) return ICON_MAPPING[0.10];
  
  // Fallback para valores muito baixos
  return ICON_MAPPING[0.05];
};

// 🏆 FUNÇÃO PARA GERAR TABELA DE PRÊMIOS PARA UMA APOSTA
export const generatePrizeTable = (betAmount) => {
  return MULTIPLIERS.map(({ multiplier, probability }) => {
    const prizeValue = betAmount * multiplier;
    const icon = getIconForValue(prizeValue);
    
    return {
      multiplier,
      probability,
      prizeValue,
      formattedValue: formatCurrency(prizeValue),
      icon: icon.icon,
      iconName: icon.name
    };
  });
};

// 💱 FUNÇÃO PARA FORMATAR MOEDA
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

// 🎮 FUNÇÃO PARA SELECIONAR MULTIPLICADOR BASEADO NA PROBABILIDADE
export const selectMultiplier = () => {
  const random = Math.random() * 100; // 0-100
  let cumulativeProbability = 0;
  
  for (const { multiplier, probability } of MULTIPLIERS) {
    cumulativeProbability += probability;
    if (random <= cumulativeProbability) {
      return multiplier;
    }
  }
  
  // Fallback para o último multiplicador
  return MULTIPLIERS[MULTIPLIERS.length - 1].multiplier;
};

// 🎯 FUNÇÃO PARA GERAR SÍMBOLOS DA RASPADINHA
export const generateScratchSymbols = (betAmount, winningMultiplier = null) => {
  const symbols = [];
  
  if (winningMultiplier && winningMultiplier > 0) {
    // VITÓRIA: 3 símbolos iguais do prêmio
    const prizeValue = betAmount * winningMultiplier;
    const winningIcon = getIconForValue(prizeValue);
    
    // Adiciona 3 símbolos vencedores
    for (let i = 0; i < 3; i++) {
      symbols.push({
        icon: winningIcon.icon,
        value: prizeValue,
        name: winningIcon.name,
        isWinning: true
      });
    }
    
    // Adiciona 6 símbolos perdedores (outros prêmios da tabela)
    const prizeTable = generatePrizeTable(betAmount);
    const otherPrizes = prizeTable.filter(prize => prize.multiplier !== winningMultiplier);
    
    for (let i = 0; i < 6; i++) {
      const randomPrize = otherPrizes[Math.floor(Math.random() * otherPrizes.length)];
      symbols.push({
        icon: randomPrize.icon,
        value: randomPrize.prizeValue,
        name: randomPrize.iconName,
        isWinning: false
      });
    }
  } else {
    // DERROTA: 9 símbolos diferentes (sem 3 iguais)
    const prizeTable = generatePrizeTable(betAmount);
    
    // Garante que não há 3 símbolos iguais
    const usedMultipliers = new Set();
    
    for (let i = 0; i < 9; i++) {
      let randomPrize;
      let attempts = 0;
      
      do {
        randomPrize = prizeTable[Math.floor(Math.random() * prizeTable.length)];
        attempts++;
      } while (
        attempts < 50 && // Evita loop infinito
        Array.from(usedMultipliers).filter(m => m === randomPrize.multiplier).length >= 2
      );
      
      usedMultipliers.add(randomPrize.multiplier);
      
      symbols.push({
        icon: randomPrize.icon,
        value: randomPrize.prizeValue,
        name: randomPrize.iconName,
        isWinning: false
      });
    }
  }
  
  // Embaralha os símbolos
  return shuffleArray(symbols);
};

// 🔀 FUNÇÃO PARA EMBARALHAR ARRAY
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 📊 CONFIGURAÇÕES GERAIS
export const GAME_CONFIG = {
  RTP: 95, // Return to Player
  MAX_MULTIPLIER: 5000,
  WIN_CHANCE: 60, // Porcentagem
  REVEAL_THRESHOLD: 80, // Porcentagem para auto-completar
  DEFAULT_BET: 0.50,
  DEFAULT_BALANCE: 100.00
};

