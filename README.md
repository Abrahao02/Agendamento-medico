# Sistema de Agendamento Médico

Um sistema completo para gerenciamento de agendamentos médicos, desenvolvido com React e Firebase. Permite que médicos configurem suas disponibilidades e pacientes agendem consultas online.

## 🚀 Funcionalidades

### Para Médicos
- **Cadastro e Login Seguro**: Autenticação com Firebase Auth, incluindo verificação de email e reset de senha.
- **Gerenciamento de Disponibilidade**: Calendário interativo para definir horários disponíveis, com slots customizáveis (ex.: 09:30, 10:00).
- **Agenda Navegável**: Visualize agendamentos por data, com navegação entre dias (anterior/próximo/hoje).
- **Controle de Consultas**: Altere status das consultas (Pendente, Confirmado, Não Compareceu).
- **Dashboard**: Indicadores de consultas do mês, horários livres e confirmados.
- **Notificações**: Envio automático de mensagens WhatsApp para pacientes.

### Para Pacientes
- **Agendamento Online**: Interface pública para agendar consultas em horários disponíveis.
- **Confirmação**: Recebem confirmação via WhatsApp após agendamento.

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, React Router DOM, CSS Modules
- **Backend**: Firebase (Authentication, Firestore)
- **Ferramentas**: Vite, ESLint, GitHub Actions
- **Integrações**: WhatsApp (via links), Email (Firebase Auth)

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- Conta Firebase

### Passos

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/Abrahao02/Agendamento-medico.git
   cd agendamento-medico
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o Firebase**:
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
   - Ative Authentication (Email/Password) e Firestore
   - Configure as regras de segurança no Firestore
   - Copie as chaves de configuração para variáveis de ambiente

4. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Execute o projeto**:
   ```bash
   npm run dev
   ```

6. **Build para produção**:
   ```bash
   npm run build
   npm run preview
   ```

7. **Deploy no Firebase**:
   ```bash
   firebase login
   firebase init hosting
   firebase deploy
   ```

## 📁 Estrutura do Projeto

```
agendamento-medico/
├── public/
├── src/
│   ├── components/
│   │   └── PrivateRoute.jsx
│   ├── pages/
│   │   ├── Agenda.jsx          # Agenda navegável por datas
│   │   ├── AllAppointments.jsx # Lista de todos agendamentos
│   │   ├── Availability.jsx    # Gerenciamento de disponibilidade
│   │   ├── Dashboard.jsx       # Dashboard com métricas
│   │   ├── Login.jsx           # Login com verificação de email
│   │   ├── Register.jsx        # Cadastro de médicos
│   │   └── PublicSchedule.jsx  # Agendamento público
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── services/
│   │   ├── firebase.js         # Configuração Firebase
│   │   └── doctors.js          # Funções para médicos
│   ├── utils/
│   │   ├── formatDate.js       # Formatação de datas (DD/MM/YYYY)
│   │   └── generateSlug.js     # Geração de slugs para URLs
│   └── App.jsx
├── dataconnect/                # Firebase Data Connect (opcional)
├── functions/                  # Cloud Functions (opcional)
├── firestore.rules            # Regras de segurança Firestore
├── firebase.json              # Configuração Firebase
└── package.json
```

## 🔧 Funcionalidades Detalhadas

### Autenticação
- Cadastro de médicos com validação de senha forte
- Verificação de email obrigatória
- Reset de senha via email
- Proteção de rotas com PrivateRoute

### Gerenciamento de Horários
- Calendário visual com badges para dias com disponibilidade
- Adição de slots customizáveis (qualquer horário)
- Remoção de slots não agendados
- Salvamento automático no Firestore

### Agenda Médica
- Navegação por datas (anterior/próximo/hoje)
- Filtro por status de consultas
- Atualização de status em tempo real
- Envio de WhatsApp para pacientes

### Agendamento Público
- URL personalizada por slug do médico
- Seleção de data e horário disponíveis
- Formulário com validação
- Confirmação via WhatsApp

## 🚀 Deploy

O projeto inclui configuração para deploy automático no Firebase Hosting via GitHub Actions.

Para deploy manual:
```bash
npm run build
firebase deploy
```

## 📝 Scripts Disponíveis

- `npm run dev`: Inicia servidor de desenvolvimento
- `npm run build`: Build para produção
- `npm run preview`: Preview do build
- `npm run lint`: Executa ESLint

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 📞 Suporte

Para dúvidas ou sugestões, abra uma issue no GitHub.

---

**Versão 1.0** - Sistema completo e funcional para agendamento médico.


