import { useState } from 'react';
import { Play, Pause, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AutoPlayControls({ autoPlay, onAutoPlayToggle, onAutoPlayConfig }) {
  const [showConfig, setShowConfig] = useState(false);
  const [selectedRounds, setSelectedRounds] = useState(10);

  const roundOptions = [10, 25, 50, 100];

  const handleStartAutoPlay = () => {
    onAutoPlayConfig(selectedRounds);
    onAutoPlayToggle();
    setShowConfig(false);
  };

  return (
    <div className="space-y-3">
      {/* Botão principal */}
      <div className="flex gap-2">
        <Button
          onClick={autoPlay.isActive ? onAutoPlayToggle : () => setShowConfig(!showConfig)}
          className={`
            flex-1 flex items-center justify-center gap-2 transition-colors
            ${autoPlay.isActive 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {autoPlay.isActive ? (
            <>
              <Pause className="w-4 h-4" />
              Parar Auto ({autoPlay.remaining})
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Auto Play
            </>
          )}
        </Button>

        {!autoPlay.isActive && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowConfig(!showConfig)}
            className="border-gray-600 text-gray-400 hover:bg-gray-700/50"
          >
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Configurações */}
      {showConfig && !autoPlay.isActive && (
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50 space-y-3">
          <div className="text-center">
            <h4 className="text-white font-medium mb-2">Rodadas Automáticas</h4>
            <p className="text-gray-400 text-sm">Selecione quantas rodadas jogar automaticamente</p>
          </div>

          {/* Opções de rodadas */}
          <div className="grid grid-cols-2 gap-2">
            {roundOptions.map((rounds) => (
              <Button
                key={rounds}
                variant="outline"
                onClick={() => setSelectedRounds(rounds)}
                className={`
                  transition-colors text-sm
                  ${selectedRounds === rounds 
                    ? 'border-blue-500 bg-blue-500/30 text-blue-300' 
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-blue-500/50 hover:bg-blue-500/10'
                  }
                `}
              >
                {rounds} rodadas
              </Button>
            ))}
          </div>

          {/* Botão iniciar */}
          <Button
            onClick={handleStartAutoPlay}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar {selectedRounds} rodadas
          </Button>
        </div>
      )}

      {/* Status do Auto Play */}
      {autoPlay.isActive && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-red-300 font-medium">
              Auto Play Ativo
            </div>
            <div className="text-red-200 text-sm">
              {autoPlay.remaining} de {autoPlay.total} rodadas restantes
            </div>
            <div className="w-full bg-red-900/50 rounded-full h-2 mt-2">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((autoPlay.total - autoPlay.remaining) / autoPlay.total) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

