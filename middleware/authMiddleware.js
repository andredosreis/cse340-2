// ==============================================
// AUTHENTICATION MIDDLEWARE
// ==============================================
// Este arquivo contém middlewares para verificar:
// - Authentication (Autenticação): Usuário está logado?
// - Authorization (Autorização): Usuário tem permissão?
//
// CONCEITO: Middleware
// - Função que executa ENTRE requisição e resposta
// - Pode bloquear acesso a rotas
// - Pode adicionar dados à requisição
// ==============================================

/* ***************************
 *  MIDDLEWARE 1: Verificar se usuário está LOGADO
 * ***************************
 *
 * OBJETIVO: Proteger rotas que exigem login
 *
 * USO: Colocar antes de rotas protegidas
 * Exemplo: router.get("/account/", checkLogin, controller.buildDashboard)
 *
 * FLUXO:
 * 1. Usuário tenta acessar rota protegida (ex: /account/)
 * 2. Middleware verifica se req.session.loggedin é true
 * 3. Se SIM (logado): chama next() → continua para o controller
 * 4. Se NÃO (não logado): redireciona para /account/login
 *
 * ANALOGIA: Segurança do clube verifica se você tem pulseira
 * - Tem pulseira? Entre (next)
 * - Não tem? Vá para a fila (redirect)
 */
function checkLogin(req, res, next) {
  // req.session.loggedin foi definido no accountController.accountLogin()
  // É true se usuário fez login, undefined se não fez

  if (req.session.loggedin) {
    // ✅ USUÁRIO ESTÁ LOGADO
    // next() = continua para o próximo middleware ou controller
    next()
  } else {
    // ❌ USUÁRIO NÃO ESTÁ LOGADO
    // Mostrar mensagem pedindo para fazer login
    req.flash("notice", "Please log in to access this page.")

    // Redirecionar para página de login
    return res.redirect("/account/login")
  }
}

/* ***************************
 *  MIDDLEWARE 2: Verificar TIPO DE CONTA (Admin ou Employee)
 * ***************************
 *
 * OBJETIVO: Proteger rotas que exigem permissões especiais
 *
 * USO: Rotas de gerenciamento (adicionar veículos, etc.)
 * Exemplo: router.get("/inv/management", checkAccountType, controller.buildManagement)
 *
 * FLUXO:
 * 1. Primeiro verifica se está logado
 * 2. Depois verifica o account_type na sessão
 * 3. Se Admin ou Employee: next() → continua
 * 4. Se Client ou não logado: redireciona com erro
 *
 * ANALOGIA: Segurança do clube verifica se você é VIP
 * - É VIP ou Staff? Entre na área VIP (next)
 * - É cliente comum? Não pode entrar (redirect)
 *
 * HIERARQUIA DE PERMISSÕES:
 * - Admin: Acesso total (adicionar, editar, deletar)
 * - Employee: Acesso parcial (adicionar, editar)
 * - Client: Sem acesso (apenas visualizar)
 */
function checkAccountType(req, res, next) {
  // PASSO 1: Verificar se está logado
  if (req.session.loggedin) {
    // PASSO 2: Pegar tipo de conta da sessão
    const accountType = req.session.accountData.account_type

    // PASSO 3: Verificar se é Admin ou Employee
    if (accountType === 'Admin' || accountType === 'Employee') {
      // ✅ TEM PERMISSÃO
      // Usuário é Admin ou Employee - pode acessar
      next()
    } else {
      // ❌ NÃO TEM PERMISSÃO
      // Usuário é Client - não pode acessar rotas administrativas
      req.flash("notice", "You do not have permission to access this page.")

      // Redirecionar para dashboard do usuário
      return res.redirect("/account/")
    }
  } else {
    // ❌ NÃO ESTÁ LOGADO
    // Usuário nem fez login ainda
    req.flash("notice", "Please log in to access this page.")

    // Redirecionar para página de login
    return res.redirect("/account/login")
  }
}

/* ***************************
 *  MIDDLEWARE 3: Redirecionar se JÁ ESTÁ LOGADO
 * ***************************
 *
 * OBJETIVO: Impedir usuários logados de acessar login/registro
 *
 * USO: Páginas de login e registro
 * Exemplo: router.get("/account/login", handleLoggedIn, controller.buildLogin)
 *
 * FLUXO:
 * 1. Usuário tenta acessar /login ou /register
 * 2. Middleware verifica se JÁ está logado
 * 3. Se SIM (já logado): redireciona para /account/ (dashboard)
 * 4. Se NÃO (não logado): next() → mostra formulário
 *
 * ANALOGIA: Você já está dentro do clube
 * - Já está dentro? Não precisa ir na fila de novo (redirect)
 * - Não está dentro? Pode entrar na fila (next)
 *
 * POR QUE FAZER ISSO?
 * - Não faz sentido mostrar página de login para quem já está logado
 * - Melhor UX (experiência do usuário)
 * - Evita confusão
 */
function handleLoggedIn(req, res, next) {
  if (req.session.loggedin) {
    // ✅ JÁ ESTÁ LOGADO
    // Redirecionar para dashboard em vez de mostrar login/registro
    return res.redirect("/account/")
  } else {
    // ❌ NÃO ESTÁ LOGADO
    // Tudo bem, pode acessar login/registro
    next()
  }
}

// ==============================================
// MIDDLEWARE GLOBAL: Disponibilizar dados da sessão nas views
// ==============================================
// Este middleware deve ser chamado em TODAS as requisições
// Ele torna accountData disponível em todos os templates EJS
//
// USO no server.js:
// app.use(authMiddleware.makeAccountDataAvailable)
function makeAccountDataAvailable(req, res, next) {
  // res.locals = variáveis disponíveis em TODAS as views EJS
  // Agora podemos usar <%= accountData %> em qualquer EJS

  if (req.session.loggedin) {
    // Se usuário está logado, disponibilizar dados na view
    res.locals.accountData = req.session.accountData
  } else {
    // Se não está logado, accountData é null
    res.locals.accountData = null
  }

  next()
}

// ==============================================
// EXPORTAR FUNÇÕES
// ==============================================
// Tornar middlewares disponíveis para as rotas
module.exports = {
  checkLogin,              // Verifica se está logado
  checkAccountType,        // Verifica se é Admin/Employee
  handleLoggedIn,          // Redireciona se já está logado
  makeAccountDataAvailable // Disponibiliza dados nas views
}
