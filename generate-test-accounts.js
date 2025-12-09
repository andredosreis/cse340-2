/**
 * Script para gerar os hashes das senhas de teste
 * 
 * EXECUTE ESTE SCRIPT NO TERMINAL:
 * node generate-test-accounts.js
 * 
 * Depois copie o SQL gerado e execute no Render PostgreSQL
 */

const bcrypt = require('bcryptjs');

// Contas de teste exigidas pelo curso
const testAccounts = [
  {
    firstname: 'Basic',
    lastname: 'Client',
    email: 'basic@340.edu',
    password: 'I@mABas1cCl!3nt',
    type: 'Client'
  },
  {
    firstname: 'Happy',
    lastname: 'Employee',
    email: 'happy@340.edu',
    password: 'I@mAnEmpl0y33',
    type: 'Employee'
  },
  {
    firstname: 'Manager',
    lastname: 'User',
    email: 'manager@340.edu',
    password: 'I@mAnAdm!n1strat0r',
    type: 'Admin'
  }
];

async function generateSQL() {
  console.log('='.repeat(60));
  console.log('GERANDO SQL PARA CONTAS DE TESTE DO CSE 340');
  console.log('='.repeat(60));
  console.log('');
  console.log('IMPORTANTE: Copie TODO o SQL abaixo e execute no Render PostgreSQL');
  console.log('');
  console.log('='.repeat(60));
  console.log('-- INÍCIO DO SQL --');
  console.log('='.repeat(60));
  console.log('');

  // Header SQL
  console.log('-- =====================================================');
  console.log('-- CSE 340 - TEST ACCOUNTS FOR GRADING');
  console.log('-- Execute this SQL in Render PostgreSQL Console');
  console.log('-- =====================================================');
  console.log('');

  // Delete existing test accounts (if any)
  console.log('-- Step 1: Remove existing test accounts (if any)');
  console.log("DELETE FROM cse340.account WHERE account_email IN ('basic@340.edu', 'happy@340.edu', 'manager@340.edu');");
  console.log('');

  // Insert new accounts
  console.log('-- Step 2: Insert test accounts with hashed passwords');
  
  for (const account of testAccounts) {
    const hash = await bcrypt.hash(account.password, 10);
    
    console.log(`-- Account: ${account.firstname} ${account.lastname} (${account.type})`);
    console.log(`-- Email: ${account.email}`);
    console.log(`-- Password: ${account.password}`);
    console.log(`INSERT INTO cse340.account (`);
    console.log(`  account_firstname,`);
    console.log(`  account_lastname,`);
    console.log(`  account_email,`);
    console.log(`  account_password,`);
    console.log(`  account_type`);
    console.log(`) VALUES (`);
    console.log(`  '${account.firstname}',`);
    console.log(`  '${account.lastname}',`);
    console.log(`  '${account.email}',`);
    console.log(`  '${hash}',`);
    console.log(`  '${account.type}'`);
    console.log(`);`);
    console.log('');
  }

  // Verification query
  console.log('-- Step 3: Verify accounts were created');
  console.log("SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM cse340.account WHERE account_email IN ('basic@340.edu', 'happy@340.edu', 'manager@340.edu');");
  console.log('');

  console.log('='.repeat(60));
  console.log('-- FIM DO SQL --');
  console.log('='.repeat(60));
  console.log('');
  console.log('INSTRUÇÕES:');
  console.log('1. Copie TODO o SQL acima (de "-- INÍCIO" até "-- FIM")');
  console.log('2. Acesse: https://dashboard.render.com');
  console.log('3. Vá para seu PostgreSQL database');
  console.log('4. Clique em "Query" ou "SQL Editor"');
  console.log('5. Cole o SQL e execute');
  console.log('6. Verifique que as 3 contas foram criadas');
  console.log('');
  console.log('CREDENCIAIS PARA O PROFESSOR TESTAR:');
  console.log('');
  testAccounts.forEach(acc => {
    console.log(`${acc.type.toUpperCase()}:`);
    console.log(`  Email: ${acc.email}`);
    console.log(`  Password: ${acc.password}`);
    console.log('');
  });
}

generateSQL().catch(console.error);
