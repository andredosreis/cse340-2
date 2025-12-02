// =====================================================
// SCRIPT PARA GERAR HASHES DE SENHA COM BCRYPT
// =====================================================
// Este script gera os hashes corretos para as senhas
// dos usuários de teste
// =====================================================

const bcrypt = require('bcryptjs');

console.log('🔐 GERANDO HASHES DE SENHA\n');
console.log('==========================================\n');

// Senhas para hash
const passwords = [
  { user: 'Admin', password: 'Admin123!' },
  { user: 'Employee', password: 'Employee123!' },
  { user: 'Client', password: 'Client123!' }
];

// Gerar hashes (assíncrono)
async function generateHashes() {
  for (const item of passwords) {
    const hash = await bcrypt.hash(item.password, 10);
    console.log(`${item.user}:`);
    console.log(`  Senha: ${item.password}`);
    console.log(`  Hash:  ${hash}`);
    console.log('');
  }

  console.log('==========================================');
  console.log('✅ Copie os hashes acima e substitua no SQL!');
  console.log('==========================================');
}

generateHashes();
