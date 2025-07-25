const axios = require('axios');

// Configuração da API
const API_BASE = process.env.API_URL || 'https://raspa-ai-mvp-production.up.railway.app';
const TENANT_HOST = 'raspa-ai-mvp-production.up.railway.app';

// Configurar axios para usar o host correto
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Host': TENANT_HOST,
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

async function testAPIs() {
  console.log('🧪 Iniciando testes das APIs...');
  console.log(`🔗 Base URL: ${API_BASE}`);
  console.log(`🏠 Host: ${TENANT_HOST}\n`);
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // Função helper para executar teste
  async function runTest(name, testFn) {
    try {
      console.log(`⏳ Testando: ${name}`);
      const result = await testFn();
      console.log(`✅ ${name}: PASSOU`);
      if (result && typeof result === 'object') {
        console.log(`   Resposta:`, JSON.stringify(result, null, 2).substring(0, 200) + '...');
      }
      results.passed++;
      results.tests.push({ name, status: 'PASSOU', result });
    } catch (error) {
      console.log(`❌ ${name}: FALHOU`);
      console.log(`   Erro: ${error.message}`);
      results.failed++;
      results.tests.push({ name, status: 'FALHOU', error: error.message });
    }
    console.log('');
  }
  
  // Teste 1: Health Check
  await runTest('Health Check', async () => {
    const response = await api.get('/health');
    return response.data;
  });
  
  // Teste 2: API Principal
  await runTest('API Principal', async () => {
    const response = await api.get('/');
    return response.data;
  });
  
  // Teste 3: Tenant Info
  await runTest('Tenant Info', async () => {
    const response = await api.get('/api/tenant/info');
    return response.data;
  });
  
  // Teste 4: Game Config
  await runTest('Game Config', async () => {
    const response = await api.get('/api/game/config');
    return response.data;
  });
  
  // Teste 5: Tenant CSS
  await runTest('Tenant CSS', async () => {
    const response = await api.get('/api/tenant/css');
    return { length: response.data.length, contentType: response.headers['content-type'] };
  });
  
  // Teste 6: Registro de usuário
  await runTest('Registro de Usuário', async () => {
    const userData = {
      email: `test${Date.now()}@railway.demo`,
      password: 'test123',
      name: 'Usuário Teste API'
    };
    
    const response = await api.post('/api/auth/register', userData);
    return { user: response.data.user, tenant: response.data.tenant };
  });
  
  // Teste 7: Login
  let authCookie = '';
  await runTest('Login de Usuário', async () => {
    const loginData = {
      email: 'admin@railway.demo',
      password: 'railway123'
    };
    
    const response = await api.post('/api/auth/login', loginData);
    
    // Extrair cookie de sessão se disponível
    if (response.headers['set-cookie']) {
      authCookie = response.headers['set-cookie'][0];
    }
    
    return response.data;
  });
  
  // Teste 8: Dados do usuário logado (se temos cookie)
  if (authCookie) {
    await runTest('Dados do Usuário Logado', async () => {
      const response = await api.get('/api/auth/me', {
        headers: { Cookie: authCookie }
      });
      return response.data;
    });
    
    // Teste 9: Dashboard Admin (se temos cookie)
    await runTest('Dashboard Admin', async () => {
      const response = await api.get('/api/admin/dashboard', {
        headers: { Cookie: authCookie }
      });
      return response.data;
    });
  }
  
  // Resumo dos testes
  console.log('📊 RESUMO DOS TESTES:');
  console.log(`✅ Passou: ${results.passed}`);
  console.log(`❌ Falhou: ${results.failed}`);
  console.log(`📈 Taxa de sucesso: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ TESTES QUE FALHARAM:');
    results.tests.filter(t => t.status === 'FALHOU').forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }
  
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  if (results.passed >= 5) {
    console.log('✅ Backend está funcionando bem!');
    console.log('🚀 Pode avançar para o frontend React');
  } else {
    console.log('⚠️  Alguns testes falharam, verificar configuração');
  }
  
  return results;
}

// Executar testes se chamado diretamente
if (require.main === module) {
  testAPIs().catch(console.error);
}

module.exports = testAPIs;

