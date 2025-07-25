import { useState } from 'react';
import { User, Wallet, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header({ user, balance, onLogin, onLogout }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleLogin = (email, password) => {
    // Simula login
    onLogin({
      id: 1,
      name: 'João Silva',
      email: email,
      balance: 100.00
    });
    setShowLoginModal(false);
  };

  return (
    <>
      <header className="bg-black/95 backdrop-blur-sm border-b border-green-500/30 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <div className="text-white">
                <div className="font-bold text-xl">RaspaAI</div>
                <div className="text-xs text-green-400 -mt-1">Raspadinha Online</div>
              </div>
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-white hover:text-green-400 transition-colors">
                Início
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors">
                Raspadinhas
              </a>
              <a href="#" className="text-white hover:text-green-400 transition-colors">
                Como Jogar
              </a>
            </nav>

            {/* Área do usuário */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Saldo */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg">
                    <Wallet className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-bold">
                      {formatCurrency(balance)}
                    </span>
                  </div>

                  {/* Botões de ação */}
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Depositar
                  </Button>
                  <Button variant="outline" className="border-gray-500 text-gray-400 hover:bg-gray-500/10">
                    Sacar
                  </Button>

                  {/* Menu do usuário */}
                  <div className="relative group">
                    <button className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors">
                      <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-white text-sm hidden sm:block">
                        {user.name.split(' ')[0]}
                      </span>
                    </button>

                    {/* Dropdown */}
                    <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                      <div className="p-3 border-b border-gray-700">
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-gray-400 text-sm">{user.email}</div>
                      </div>
                      <div className="p-2">
                        <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
                          Meu Perfil
                        </button>
                        <button className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors">
                          Histórico
                        </button>
                        <button 
                          onClick={onLogout}
                          className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-gray-800 rounded transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Sair
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowLoginModal(true)}
                    className="border-green-500 text-green-400 hover:bg-green-500/10"
                  >
                    Entrar
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Registrar
                  </Button>
                </>
              )}

              {/* Menu mobile */}
              <button
                className="md:hidden text-white"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Menu Mobile */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-700 py-4">
              <nav className="flex flex-col gap-3">
                <a href="#" className="text-white hover:text-green-400 transition-colors py-2">
                  Início
                </a>
                <a href="#" className="text-white hover:text-green-400 transition-colors py-2">
                  Raspadinhas
                </a>
                <a href="#" className="text-white hover:text-green-400 transition-colors py-2">
                  Como Jogar
                </a>
                {user && (
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-2 mb-3">
                      <Wallet className="w-4 h-4 text-green-400" />
                      <span className="text-white font-bold">
                        {formatCurrency(balance)}
                      </span>
                    </div>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Modal de Login */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo de volta!</h2>
              <p className="text-gray-400">Conecte-se para acompanhar seus prêmios</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleLogin(formData.get('email'), formData.get('password'));
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue="admin@demo.com"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                    placeholder="example@site.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Senha
                  </label>
                  <input
                    type="password"
                    name="password"
                    defaultValue="123456"
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:outline-none"
                    placeholder="Insira sua senha..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white">
                  Entrar
                </Button>
              </div>
            </form>

            <div className="text-center mt-4">
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

