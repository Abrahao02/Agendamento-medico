# 🩺 Sistema de Agendamento Médico — Plataforma SaaS

Uma **plataforma SaaS de agendamento médico online**, desenvolvida para automatizar a gestão de consultas, reduzir faltas e simplificar a comunicação entre médicos e clientes.

O sistema permite que profissionais de saúde gerenciem sua agenda de forma inteligente, enquanto clientes realizam agendamentos de maneira rápida, segura e totalmente online.

---

## 💡 Visão do Produto

Clínicas e profissionais de saúde perdem tempo com:
- Agendamentos manuais
- Falta de controle de horários
- Confirmações feitas individualmente
- clientes que esquecem consultas

Este sistema resolve esses problemas oferecendo uma **experiência digital completa**, moderna e escalável, pronta para uso em produção como um produto SaaS.

---

## 🚀 Principais Benefícios

- ⏱️ Redução de tempo operacional
- 📅 Controle total da agenda médica
- 📉 Diminuição de faltas em consultas
- 🔐 Segurança e confiabilidade dos dados
- 🌐 Acesso online para médicos e clientes
- 📈 Estrutura escalável para crescimento do negócio

---

## 👨‍⚕️ Funcionalidades para Médicos

- **Autenticação Segura**
  - Cadastro e login com autenticação robusta
  - Verificação de e-mail
  - Recuperação de senha

- **Gerenciamento de Disponibilidade**
  - Definição de horários livres por dia
  - Slots customizáveis (ex.: 09:30, 10:00, 14:15)
  - Bloqueio automático de horários já agendados

- **Agenda Inteligente**
  - Visualização diária da agenda
  - Navegação entre dias (anterior / próximo / hoje)
  - Atualização de status das consultas:
    - Pendente
    - Confirmada
    - Não compareceu

- **Dashboard**
  - Visão geral das consultas do mês
  - Quantidade de horários livres e ocupados
  - Indicadores operacionais em tempo real

- **Comunicação Automática**
  - Envio de mensagens automáticas via WhatsApp
  - Confirmação instantânea de agendamentos

---

## 🧑‍🤝‍🧑 Funcionalidades para clientes

- **Agendamento Online**
  - Acesso público sem necessidade de login
  - Visualização apenas de horários disponíveis
  - Interface simples e intuitiva

- **Confirmação Automática**
  - Confirmação do agendamento via WhatsApp
  - Redução de esquecimentos e faltas

---

## 🔐 Segurança e Confiabilidade

- Autenticação gerenciada por **Firebase Authentication**
- Dados armazenados com **regras de segurança no Firestore**
- Variáveis sensíveis protegidas via **variáveis de ambiente**
- Separação clara entre áreas públicas e privadas
- Estrutura pronta para conformidade com boas práticas de segurança

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18
- React Router DOM
- Vite
- CSS modularizado

### Backend & Infraestrutura
- Firebase Authentication
- Firestore Database
- Firebase Hosting
- Cloud Functions (opcional)

### DevOps & Qualidade
- ESLint
- GitHub Actions (CI/CD)
- Controle de versão com Git

---

## 🧩 Arquitetura do Sistema

- Aplicação SPA moderna
- Backend serverless
- Separação clara entre:
  - Área pública (clientes)
  - Área autenticada (médicos)
- Estrutura escalável para múltiplos profissionais

---

## 🌐 Acesso à Plataforma

🔗 **Aplicação em produção:**  
> [Link da aplicação](https://etna-agendamento-medico.web.app/login)

---

## 🎯 Público-Alvo

- Médicos autônomos
- Clínicas médicas
- Consultórios
- Profissionais da área da saúde que desejam digitalizar seu atendimento

---

## 📈 Potencial como SaaS

- Modelo de assinatura mensal
- Multiusuário
- Fácil personalização por profissional
- Base sólida para expansão (pagamentos, prontuários, lembretes automáticos)

---

## 📄 Licença

Este projeto está licenciado sob a licença **MIT**, permitindo uso comercial e personalizações.

---

## 👨‍💻 Autor

Desenvolvido por **Eduardo de Sá Abrahão**  
Projeto com foco em qualidade, escalabilidade e experiência do usuário.

---

⭐ Se este projeto chamou sua atenção, considere deixar uma estrela no repositório.
