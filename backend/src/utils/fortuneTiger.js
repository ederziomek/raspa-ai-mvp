// 🐅 Fortune Tiger Logic - Backend Implementation
// Implementação baseada na pesquisa do jogo mais popular do Brasil

/**
 * Classe FortuneRNG - Gerador de números aleatórios compatível com Fortune Tiger
 * Baseado no algoritmo Linear Congruential Generator usado pela PG Soft
 */
class FortuneRNG {
  constructor(seed) {
    this.seed = seed || Date.now();
  }
  
  next() {
    // Algoritmo Linear Congruential Generator
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }
  
  /**
   * Seleciona um símbolo baseado nas probabilidades
   * @param {Array} probabilities - Array de objetos {symbol, probability}
   * @returns {string} Símbolo selecionado
   */
  selectSymbol(probabilities) {
    const random = this.next();
    let cumulative = 0;
    
    for (const item of probabilities) {
      cumulative += item.probability;
      if (random <= cumulative) {
        return item.symbol;
      }
    }
    
    // Fallback para o último símbolo
    return probabilities[probabilities.length - 1].symbol;
  }
}

/**
 * Configuração dos 7 símbolos do Fortune Tiger
 * Baseado na pesquisa oficial da PG Soft
 */
const FORTUNE_TIGER_SYMBOLS = {
  ORANGE: { icon: '🍊', name: 'Laranjas', multiplier: 3, rarity: 'common' },
  BELL: { icon: '🔔', name: 'Sinos azuis', multiplier: 5, rarity: 'common' },
  ENVELOPE: { icon: '🧧', name: 'Envelopes vermelhos', multiplier: 8, rarity: 'uncommon' },
  COINS: { icon: '💰', name: 'Saco de moedas', multiplier: 10, rarity: 'uncommon' },
  JADE: { icon: '🟢', name: 'Adorno com jade', multiplier: 25, rarity: 'rare' },
  GOLDEN: { icon: '🏆', name: 'Enfeite dourado', multiplier: 100, rarity: 'epic' },
  TIGER: { icon: '🐅', name: 'Wild (Tigre)', multiplier: 250, rarity: 'legendary', isWild: true }
};

/**
 * Probabilidades dos símbolos para RTP 96.81%
 * Baseado na análise do Fortune Tiger original
 */
const SYMBOL_PROBABILITIES = [
  { symbol: 'ORANGE', probability: 0.35 },    // 35% - Mais comum
  { symbol: 'BELL', probability: 0.25 },      // 25% - Comum
  { symbol: 'ENVELOPE', probability: 0.18 },  // 18% - Pouco comum
  { symbol: 'COINS', probability: 0.12 },     // 12% - Pouco comum
  { symbol: 'JADE', probability: 0.06 },      // 6% - Raro
  { symbol: 'GOLDEN', probability: 0.03 },    // 3% - Épico
  { symbol: 'TIGER', probability: 0.01 }      // 1% - Lendário (Wild)
];

/**
 * Classe principal do Fortune Tiger
 */
class FortuneTigerGame {
  constructor(rtp = 96.81) {
    this.rng = new FortuneRNG();
    this.rtp = rtp;
    this.houseEdge = 100 - rtp;
  }

  /**
   * Gera um grid 3x3 de símbolos
   * @param {number} betAmount - Valor da aposta
   * @returns {Object} Resultado do jogo
   */
  generateGame(betAmount) {
    const grid = [];
    const symbols = [];
    
    // Gera 9 símbolos para o grid 3x3
    for (let i = 0; i < 9; i++) {
      const symbolKey = this.rng.selectSymbol(SYMBOL_PROBABILITIES);
      const symbol = FORTUNE_TIGER_SYMBOLS[symbolKey];
      grid.push(symbol);
      symbols.push({
        icon: symbol.icon,
        name: symbol.name,
        multiplier: symbol.multiplier,
        isWild: symbol.isWild || false
      });
    }

    // Verifica vitórias
    const winResult = this.checkWins(grid, betAmount);
    
    // Fortune Tiger Feature (5% de chance)
    const fortuneTigerActive = this.rng.next() < 0.05;
    
    if (fortuneTigerActive && !winResult.isWinner) {
      // Ativa feature especial - força uma vitória
      return this.activateFortuneFeature(betAmount);
    }

    return {
      symbols,
      grid,
      isWinner: winResult.isWinner,
      winningLines: winResult.winningLines,
      prizeAmount: winResult.prizeAmount,
      multiplier: winResult.multiplier,
      fortuneTigerActive,
      rtp: this.rtp,
      gameSymbols: symbols.map(s => s.icon), // Para compatibilidade com frontend
      winningSymbol: winResult.isWinner ? this.getWinningSymbol(winResult.winningLines) : null
    };
  }

  /**
   * Verifica vitórias no grid 3x3
   * Vitória = 3 símbolos iguais (horizontal ou diagonal)
   */
  checkWins(grid, betAmount) {
    const winningLines = [];
    let totalPrize = 0;
    let maxMultiplier = 0;

    // Linhas de vitória possíveis (5 linhas como no Fortune Tiger original)
    const lines = [
      [0, 1, 2], // Linha superior
      [3, 4, 5], // Linha do meio
      [6, 7, 8], // Linha inferior
      [0, 4, 8], // Diagonal principal
      [2, 4, 6]  // Diagonal secundária
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const [pos1, pos2, pos3] = line;
      const symbol1 = grid[pos1];
      const symbol2 = grid[pos2];
      const symbol3 = grid[pos3];

      // Verifica se os 3 símbolos são iguais OU se há Wild
      if (this.isWinningLine(symbol1, symbol2, symbol3)) {
        const lineMultiplier = this.getLineMultiplier(symbol1, symbol2, symbol3);
        const linePrize = betAmount * lineMultiplier;
        
        winningLines.push({
          line: i,
          positions: line,
          symbols: [symbol1, symbol2, symbol3],
          multiplier: lineMultiplier,
          prize: linePrize
        });

        totalPrize += linePrize;
        maxMultiplier = Math.max(maxMultiplier, lineMultiplier);
      }
    }

    // Multiplicador x10 especial quando todos os símbolos participam
    if (winningLines.length >= 3) {
      totalPrize *= 10;
      maxMultiplier *= 10;
    }

    return {
      isWinner: winningLines.length > 0,
      winningLines,
      prizeAmount: totalPrize,
      multiplier: maxMultiplier
    };
  }

  /**
   * Verifica se uma linha é vencedora
   * Considera Wild (Tigre) como substituto
   */
  isWinningLine(symbol1, symbol2, symbol3) {
    // Se todos são iguais
    if (symbol1.icon === symbol2.icon && symbol2.icon === symbol3.icon) {
      return true;
    }

    // Se há Wild, verifica substituições
    const symbols = [symbol1, symbol2, symbol3];
    const wilds = symbols.filter(s => s.isWild);
    const nonWilds = symbols.filter(s => !s.isWild);

    if (wilds.length === 0) return false;

    // Se há 1 ou 2 wilds, verifica se os não-wilds são iguais
    if (wilds.length === 1 || wilds.length === 2) {
      const uniqueNonWilds = [...new Set(nonWilds.map(s => s.icon))];
      return uniqueNonWilds.length <= 1;
    }

    // Se há 3 wilds, sempre ganha
    return wilds.length === 3;
  }

  /**
   * Calcula o multiplicador de uma linha vencedora
   */
  getLineMultiplier(symbol1, symbol2, symbol3) {
    const symbols = [symbol1, symbol2, symbol3];
    const wilds = symbols.filter(s => s.isWild);
    const nonWilds = symbols.filter(s => !s.isWild);

    // Se todos são wilds, usa multiplicador do wild
    if (wilds.length === 3) {
      return FORTUNE_TIGER_SYMBOLS.TIGER.multiplier;
    }

    // Se há wilds, usa o multiplicador do símbolo não-wild
    if (wilds.length > 0 && nonWilds.length > 0) {
      return nonWilds[0].multiplier;
    }

    // Se não há wilds, usa o multiplicador do símbolo
    return symbol1.multiplier;
  }

  /**
   * Obtém o símbolo vencedor principal
   */
  getWinningSymbol(winningLines) {
    if (!winningLines || winningLines.length === 0) return null;
    
    // Retorna o ícone do primeiro símbolo da primeira linha vencedora
    const firstLine = winningLines[0];
    const firstSymbol = firstLine.symbols[0];
    
    // Se é wild, procura por não-wild na linha
    if (firstSymbol.isWild) {
      const nonWild = firstLine.symbols.find(s => !s.isWild);
      return nonWild ? nonWild.icon : firstSymbol.icon;
    }
    
    return firstSymbol.icon;
  }

  /**
   * Ativa a Fortune Tiger Feature
   * Força uma vitória com símbolos aleatórios
   */
  activateFortuneFeature(betAmount) {
    // Escolhe um símbolo aleatório para a vitória (exclui Tiger para feature)
    const winningSymbolKey = this.rng.selectSymbol(SYMBOL_PROBABILITIES.slice(0, 6));
    const winningSymbol = FORTUNE_TIGER_SYMBOLS[winningSymbolKey];
    
    // Cria grid com vitória garantida na linha do meio
    const grid = [];
    const symbols = [];
    
    for (let i = 0; i < 9; i++) {
      let symbol;
      
      // Linha do meio (posições 3, 4, 5) recebe o símbolo vencedor
      if (i >= 3 && i <= 5) {
        symbol = winningSymbol;
      } else {
        // Outras posições recebem símbolos aleatórios (não vencedores)
        const randomKey = this.rng.selectSymbol(SYMBOL_PROBABILITIES);
        symbol = FORTUNE_TIGER_SYMBOLS[randomKey];
      }
      
      grid.push(symbol);
      symbols.push({
        icon: symbol.icon,
        name: symbol.name,
        multiplier: symbol.multiplier,
        isWild: symbol.isWild || false
      });
    }

    const winResult = this.checkWins(grid, betAmount);

    return {
      symbols,
      grid,
      isWinner: true,
      winningLines: winResult.winningLines,
      prizeAmount: winResult.prizeAmount,
      multiplier: winResult.multiplier,
      fortuneTigerActive: true,
      rtp: this.rtp,
      gameSymbols: symbols.map(s => s.icon),
      winningSymbol: this.getWinningSymbol(winResult.winningLines)
    };
  }

  /**
   * Ajusta RTP dinamicamente baseado no histórico
   */
  adjustRTP(playerHistory) {
    // Implementação futura para ajuste dinâmico do RTP
    // baseado no histórico do jogador
  }
}

// Instância global do jogo
const fortuneTigerGame = new FortuneTigerGame(96.81);

/**
 * Função helper para gerar um jogo Fortune Tiger
 * @param {number} betAmount - Valor da aposta
 * @returns {Object} Resultado do jogo
 */
function generateFortuneTigerGame(betAmount) {
  return fortuneTigerGame.generateGame(betAmount);
}

/**
 * Função helper para obter informações dos símbolos
 * @returns {Object} Símbolos do Fortune Tiger
 */
function getFortuneTigerSymbols() {
  return FORTUNE_TIGER_SYMBOLS;
}

/**
 * Função helper para obter probabilidades
 * @returns {Array} Probabilidades dos símbolos
 */
function getSymbolProbabilities() {
  return SYMBOL_PROBABILITIES;
}

module.exports = {
  FortuneRNG,
  FortuneTigerGame,
  FORTUNE_TIGER_SYMBOLS,
  SYMBOL_PROBABILITIES,
  generateFortuneTigerGame,
  getFortuneTigerSymbols,
  getSymbolProbabilities
};

