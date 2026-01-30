// ============================================
// Mock do Firebase para testes E2E
// Intercepta chamadas de rede para Firebase Auth e Firestore
// ============================================

/**
 * Configura mocks para Firebase Auth e Firestore
 * Deve ser chamado no beforeEach dos testes
 * @param {import('@playwright/test').Page} page - Instância da página Playwright
 */
export async function mockFirebase(page) {
  // Mock Firebase Auth - identitytoolkit
  await page.route('**/identitytoolkit.googleapis.com/**', route => {
    const url = route.request().url();

    // Mock para signInWithPassword
    if (url.includes('signInWithPassword')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#VerifyPasswordResponse',
          localId: 'mock-user-id',
          email: 'test@example.com',
          displayName: 'Test User',
          idToken: 'mock-id-token',
          registered: true,
          refreshToken: 'mock-refresh-token',
          expiresIn: '3600'
        })
      });
      return;
    }

    // Mock para createAuthUri (verificar se email existe)
    if (url.includes('createAuthUri')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#CreateAuthUriResponse',
          allProviders: ['password'],
          registered: true
        })
      });
      return;
    }

    // Mock para signUp (criar conta)
    if (url.includes('signUp')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#SignupNewUserResponse',
          localId: 'new-mock-user-id',
          email: 'new@example.com',
          idToken: 'mock-new-id-token',
          refreshToken: 'mock-new-refresh-token',
          expiresIn: '3600'
        })
      });
      return;
    }

    // Mock para getAccountInfo
    if (url.includes('getAccountInfo')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [{
            localId: 'mock-user-id',
            email: 'test@example.com',
            displayName: 'Test User',
            emailVerified: true
          }]
        })
      });
      return;
    }

    // Default: retorna resposta vazia
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({})
    });
  });

  // Mock Firebase Auth - securetoken (refresh tokens)
  await page.route('**/securetoken.googleapis.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        expires_in: '3600',
        token_type: 'Bearer',
        refresh_token: 'mock-refresh-token',
        id_token: 'mock-id-token',
        user_id: 'mock-user-id',
        project_id: 'mock-project'
      })
    });
  });

  // Mock Firestore REST API
  await page.route('**/firestore.googleapis.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ documents: [] })
    });
  });

  // Mock Firebase Realtime Database (se usado)
  await page.route('**/*.firebaseio.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({})
    });
  });
}

/**
 * Mock para simular erro de autenticacao
 * Usar quando quiser testar tratamento de erros
 * @param {import('@playwright/test').Page} page
 */
export async function mockFirebaseAuthError(page) {
  await page.route('**/identitytoolkit.googleapis.com/**', route => {
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({
        error: {
          code: 400,
          message: 'INVALID_LOGIN_CREDENTIALS',
          errors: [{
            message: 'INVALID_LOGIN_CREDENTIALS',
            domain: 'global',
            reason: 'invalid'
          }]
        }
      })
    });
  });
}

/**
 * Mock para medico nao encontrado (usado em appointment tests)
 * @param {import('@playwright/test').Page} page
 */
export async function mockDoctorNotFound(page) {
  await page.route('**/firestore.googleapis.com/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ documents: [] })
    });
  });
}
