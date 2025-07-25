import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, DollarSign } from 'lucide-react';
import { gerarGanhadorAleatorio, gerarListaInicial, feedConfig } from '../data/mockData';

export function WinnersFeed() {
  const [ganhadores, setGanhadores] = useState([]);

  useEffect(() => {
    // Inicializa com lista de ganhadores
    setGanhadores(gerarListaInicial(feedConfig.maxItensVisiveis));

    // Configura intervalo para adicionar novos ganhadores
    const interval = setInterval(() => {
      if (Math.random() < feedConfig.probabilidadeNovoGanhador) {
        const novoGanhador = gerarGanhadorAleatorio();
        
        setGanhadores(prev => {
          const novosGanhadores = [novoGanhador, ...prev];
          // Mantém apenas os itens mais recentes
          return novosGanhadores.slice(0, feedConfig.maxItensVisiveis);
        });
      }
    }, feedConfig.intervaloAtualizacao);

    return () => clearInterval(interval);
  }, []);

  const formatarValor = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarTempo = (timestamp) => {
    const agora = new Date();
    const diff = agora - timestamp;
    const minutos = Math.floor(diff / (1000 * 60));
    
    if (minutos < 1) return 'agora';
    if (minutos < 60) return `${minutos}m atrás`;
    
    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `${horas}h atrás`;
    
    const dias = Math.floor(horas / 24);
    return `${dias}d atrás`;
  };

  return (
    <div className="bg-black/90 text-white p-4 rounded-lg border border-green-500/30">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-400 font-semibold text-sm">AO VIVO</span>
        <Trophy className="w-4 h-4 text-yellow-500" />
        <span className="text-white font-bold">Destaques</span>
      </div>

      <div className="space-y-2 max-h-80 overflow-hidden">
        <AnimatePresence mode="popLayout">
          {ganhadores.map((ganhador) => (
            <motion.div
              key={ganhador.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-green-500/50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {ganhador.nome.charAt(0)}
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium text-sm truncate">
                    {ganhador.nome}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatarTempo(ganhador.timestamp)}
                  </span>
                </div>
                
                <div className="text-gray-300 text-xs truncate">
                  {ganhador.premio}
                </div>
              </div>

              {/* Valor */}
              <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded">
                <DollarSign className="w-3 h-3 text-green-400" />
                <span className="text-green-400 font-bold text-xs">
                  {formatarValor(ganhador.valor)}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Rodapé */}
      <div className="mt-4 pt-3 border-t border-gray-700/50">
        <button className="w-full text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
          Ver mais ganhadores
        </button>
      </div>
    </div>
  );
}

