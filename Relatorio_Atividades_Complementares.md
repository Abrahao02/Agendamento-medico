# RELATÓRIO DE ATIVIDADE EXTRAORDINÁRIA

## Validação de Atividades Complementares

**Curso:** Engenharia de Software  
**Instituição:** Instituto INFNET  
**Aluno:** Eduardo de Sá Abrahão  
**Período de Realização:** Dezembro/2025 – Janeiro/2026  
**Carga Horária Solicitada:** 50 horas  
**Categoria:** Atividade Extraordinária, não prevista nos itens anteriores  

---

## 1. INTRODUÇÃO

O presente relatório tem por objetivo documentar e justificar o desenvolvimento de um projeto de software como atividade extraordinária complementar ao curso de Engenharia de Software. O projeto consiste em uma plataforma SaaS (Software as a Service) de agendamento médico online, concebida para automatizar a gestão de consultas em estabelecimentos de saúde, reduzir o índice de abstenções e otimizar a comunicação entre profissionais de saúde e pacientes.

O sistema foi desenvolvido visando atender uma necessidade real de mercado, tendo sido implementado com arquitetura escalável, práticas de segurança robustas e integração com serviços externos de pagamento e autenticação. Durante o desenvolvimento, foram aplicados conceitos fundamentais de Engenharia de Software, incluindo análise de requisitos, modelagem de dados, desenvolvimento de interfaces, implementação de lógica de negócio, validação de dados, testes funcionais e deploy em ambiente de produção.

A escolha por desenvolver uma solução real, funcional e aplicável ao mercado fundamenta-se no entendimento de que a formação em Engenharia de Software transcende o âmbito teórico, exigindo do profissional a capacidade de conceber, projetar e implementar sistemas que solucionem problemas concretos. Esta atividade, portanto, representa não apenas o exercício de competências técnicas, mas também a aplicação prática dos conhecimentos adquiridos ao longo da graduação em um contexto profissional realista.

---

## 2. OBJETIVOS DO PROJETO

### 2.1. Objetivo Geral

Desenvolver uma plataforma SaaS completa e funcional para gestão de agendamentos médicos, oferecendo aos profissionais de saúde ferramentas automatizadas para controle de agenda e aos pacientes um canal simplificado para marcação de consultas online.

### 2.2. Objetivos Específicos

1. **Projetar uma arquitetura escalável e segura**, utilizando serviços serverless e banco de dados NoSQL, garantindo capacidade de crescimento e integridade dos dados;

2. **Implementar sistema de autenticação robusto**, permitindo acesso seguro aos profissionais de saúde com verificação de e-mail e recuperação de senha;

3. **Desenvolver interface intuitiva e responsiva**, seguindo princípios modernos de UX/UI para garantir facilidade de uso tanto para profissionais quanto para pacientes;

4. **Criar sistema de gerenciamento de disponibilidade**, permitindo aos médicos definir horários livres de forma flexível e visualizar ocupação da agenda em tempo real;

5. **Implementar agendamento público**, possibilitando que pacientes realizem marcações online sem necessidade de cadastro prévio, reduzindo barreiras de acesso;

6. **Desenvolver sistema de planos e assinaturas**, integrando processamento de pagamentos recorrentes através de gateway especializado;

7. **Aplicar validações server-side**, garantindo integridade das operações críticas e prevenindo inconsistências de dados;

8. **Implementar regras de segurança no banco de dados**, protegendo informações sensíveis e garantindo acesso apropriado conforme perfil de usuário;

9. **Realizar deploy em ambiente de produção**, tornando a aplicação acessível e disponível para uso real;

10. **Documentar o sistema de forma abrangente**, produzindo documentação técnica completa para facilitar manutenção e evolução futura do projeto.

---

## 3. DESCRIÇÃO DETALHADA DAS ATIVIDADES DESENVOLVIDAS

O desenvolvimento do sistema foi estruturado em múltiplas etapas, cada uma envolvendo atividades específicas de Engenharia de Software. A seguir, são descritas as principais atividades realizadas durante o projeto.

### 3.1. Levantamento e Análise de Requisitos

A fase inicial do projeto consistiu na identificação e formalização dos requisitos funcionais e não funcionais do sistema. Através de análise de necessidades do público-alvo, foram identificadas as seguintes demandas essenciais:

- **Requisitos Funcionais:** Autenticação de usuários, gerenciamento de disponibilidade de horários, criação e edição de consultas, sistema de status de agendamentos, dashboard com métricas, gestão de pacientes, configurações personalizáveis, agendamento público sem autenticação, processamento de pagamentos e assinaturas.

- **Requisitos Não Funcionais:** Segurança dos dados, escalabilidade da arquitetura, performance adequada para acesso simultâneo, interface responsiva para diferentes dispositivos, disponibilidade de 99% do sistema, conformidade com boas práticas de privacidade.

Esta etapa demandou aproximadamente 6 horas de trabalho, incluindo pesquisa de mercado, análise de concorrentes e documentação dos requisitos.

### 3.2. Modelagem de Dados e Arquitetura do Sistema

Foi projetada uma arquitetura baseada em microsserviços serverless, utilizando Firebase como plataforma de backend. A modelagem de dados contemplou as seguintes coleções no Firestore:

- **doctors:** Armazena dados dos profissionais, incluindo configurações de mensagens, tipos de atendimento e limites de plano;
- **availability:** Registra a disponibilidade de horários por médico e data;
- **appointments:** Contém os agendamentos realizados, com informações de paciente, horário, status e tipo de atendimento;
- **patients:** Cadastro de pacientes com histórico de consultas e preços personalizados.

A arquitetura foi desenhada seguindo o padrão de separação de responsabilidades, dividindo a aplicação em camadas: apresentação (componentes React), lógica de negócio (hooks customizados), serviços (comunicação com APIs) e utilitários (funções auxiliares reutilizáveis).

Tempo estimado desta fase: 8 horas.

### 3.3. Desenvolvimento do Frontend

O desenvolvimento da interface de usuário foi realizado utilizando React 19, com foco em componentização, reutilização de código e experiência do usuário. Foram implementadas as seguintes páginas principais:

- **Landing Page:** Página inicial com apresentação do serviço e planos disponíveis;
- **Login e Registro:** Autenticação segura com validação de e-mail;
- **Dashboard:** Visão geral com métricas, gráficos e indicadores operacionais;
- **Agenda:** Visualização diária dos compromissos com navegação entre datas;
- **Disponibilidade:** Gerenciamento de horários livres com visualização mensal em calendário;
- **Todos os Agendamentos:** Listagem completa de consultas com filtros avançados;
- **Pacientes:** Cadastro e gestão de pacientes com histórico de atendimentos;
- **Configurações:** Personalização de mensagens, tipos de atendimento e gestão de assinatura;
- **Agendamento Público:** Interface simplificada para pacientes realizarem marcações online.

Foram desenvolvidos mais de 40 componentes React reutilizáveis, 15 hooks customizados para gerenciamento de estado e lógica de negócio, e diversas funções utilitárias para manipulação de datas, formatação de dados e validações client-side.

Tempo estimado desta fase: 18 horas.

### 3.4. Desenvolvimento do Backend

A camada de backend foi implementada utilizando Firebase Functions v2 com TypeScript, garantindo type safety e reduzindo erros em tempo de execução. As principais funções desenvolvidas foram:

- **createPublicAppointment:** Função callable responsável por criar agendamentos a partir da interface pública, realizando validações server-side de disponibilidade, limites de plano e prevenção de double-booking;
- **validateAppointmentLimit:** Validação automática dos limites de consultas conforme plano do profissional;
- **createCheckoutSession:** Criação de sessão de checkout no Stripe para upgrade de plano;
- **cancelSubscription:** Cancelamento de assinatura com manutenção do acesso até o fim do período pago;
- **reactivateSubscription:** Reativação de assinatura cancelada;
- **webhookHandler:** Processamento de eventos do Stripe (pagamento confirmado, renovação, cancelamento).

Todas as funções implementam validações rigorosas de entrada, tratamento de erros e logging adequado para facilitar depuração e manutenção.

Tempo estimado desta fase: 10 horas.

### 3.5. Integração com Serviços Externos

O sistema foi integrado com serviços externos especializados para funcionalidades críticas:

- **Firebase Authentication:** Sistema de autenticação com suporte a e-mail/senha, verificação de e-mail e recuperação de senha;
- **Firestore Database:** Banco de dados NoSQL com sincronização em tempo real;
- **Stripe:** Processamento de pagamentos recorrentes, gerenciamento de assinaturas e webhooks;
- **Firebase Hosting:** Hospedagem da aplicação com certificado SSL e CDN global.

A integração exigiu configuração de variáveis de ambiente, secrets management para credenciais sensíveis, implementação de webhooks e testes de fluxos de pagamento.

Tempo estimado desta fase: 4 horas.

### 3.6. Implementação de Segurança

Foram implementadas múltiplas camadas de segurança para proteger dados e operações do sistema:

- **Regras de Segurança do Firestore:** Definição de políticas de acesso baseadas em autenticação e ownership de dados;
- **Validação Server-Side:** Operações críticas como criação de agendamentos públicos são validadas no backend para prevenir manipulação client-side;
- **Secrets Management:** Credenciais sensíveis (API keys do Stripe) gerenciadas via Firebase Secret Manager;
- **Proteção de Rotas:** Implementação de rotas privadas que redirecionam usuários não autenticados;
- **Sanitização de Inputs:** Validação e sanitização de dados de entrada para prevenir injeção de código.

Tempo estimado desta fase: 3 horas.

### 3.7. Testes e Validação

Embora testes automatizados não tenham sido implementados nesta versão, foram realizados extensivos testes funcionais manuais cobrindo:

- Fluxos completos de autenticação (registro, login, logout, recuperação de senha);
- Criação, edição e exclusão de disponibilidades;
- Agendamento de consultas por ambas as interfaces (médico e pública);
- Alteração de status de agendamentos;
- Processamento de pagamentos e webhooks do Stripe;
- Comportamento do sistema em diferentes dispositivos e tamanhos de tela;
- Validação de edge cases e cenários de erro.

Tempo estimado desta fase: 4 horas.

### 3.8. Deploy e Configuração de Produção

O sistema foi implantado em ambiente de produção utilizando Firebase Hosting para o frontend e Firebase Functions para o backend. O processo incluiu:

- Configuração de ambiente de produção com variáveis apropriadas;
- Build otimizado do frontend com Vite;
- Compilação do TypeScript do backend;
- Deploy de functions e hosting via Firebase CLI;
- Configuração de domínio customizado;
- Verificação de logs e monitoramento básico.

A aplicação encontra-se disponível publicamente em: https://etna-agendamento-medico.web.app/

Tempo estimado desta fase: 3 horas.

### 3.9. Documentação Técnica

Foi produzida documentação técnica abrangente cobrindo todos os aspectos do sistema:

- README.md principal com visão geral, instalação e configuração;
- Documentação de backend (Firebase Functions);
- Documentação de serviços Firebase;
- Documentação de hooks customizados;
- Documentação de páginas da aplicação;
- Documentação de componentes React;
- Documentação da integração com Stripe;
- Documentação de funções utilitárias.

A documentação totaliza mais de 4.000 linhas de texto técnico, facilitando manutenção futura e onboarding de novos desenvolvedores.

Tempo estimado desta fase: 4 horas.

---

## 4. METODOLOGIA APLICADA

O desenvolvimento do projeto seguiu uma abordagem iterativa e incremental, inspirada em metodologias ágeis de desenvolvimento de software. Embora não tenha sido aplicado um framework específico como Scrum ou Kanban de forma rigorosa, o processo adotado incorporou princípios dessas metodologias.

### 4.1. Processo de Desenvolvimento

O trabalho foi organizado em ciclos de desenvolvimento, onde cada ciclo consistia em:

1. **Planejamento:** Definição das funcionalidades a serem implementadas no ciclo;
2. **Desenvolvimento:** Implementação das funcionalidades planejadas;
3. **Validação:** Testes e ajustes das funcionalidades desenvolvidas;
4. **Revisão:** Análise dos resultados e planejamento do próximo ciclo.

Esta abordagem permitiu flexibilidade para ajustar prioridades conforme necessário e incorporar aprendizados de cada ciclo nos subsequentes.

### 4.2. Controle de Versão

Foi utilizado Git como sistema de controle de versão, com repositório hospedado no GitHub. O uso de commits frequentes e mensagens descritivas permitiu rastrear a evolução do projeto e facilitar reversões quando necessário.

### 4.3. Padrões de Código

Foram adotados padrões consistentes de codificação, incluindo:

- **Nomenclatura semântica:** Variáveis, funções e componentes com nomes descritivos;
- **Modularização:** Separação de responsabilidades em módulos independentes;
- **Reutilização:** Criação de componentes e funções reutilizáveis;
- **Organização:** Estrutura de pastas lógica e consistente;
- **Linting:** Uso de ESLint para garantir qualidade do código.

### 4.4. Gestão de Configuração

Variáveis de ambiente foram utilizadas para gerenciar configurações diferentes entre desenvolvimento e produção, garantindo segurança e flexibilidade na implantação do sistema.

---

## 5. TECNOLOGIAS UTILIZADAS

O projeto foi desenvolvido utilizando um stack tecnológico moderno e amplamente adotado pela indústria de software. A escolha das tecnologias baseou-se em critérios de escalabilidade, segurança, produtividade e alinhamento com os conhecimentos adquiridos no curso de Engenharia de Software.

### 5.1. Frontend

**React 19**  
Framework JavaScript para construção de interfaces de usuário baseadas em componentes. Permite desenvolvimento eficiente de Single Page Applications (SPAs) com atualização reativa de interface.

**React Router DOM 7**  
Biblioteca de roteamento para React, gerenciando navegação entre páginas sem recarregamento completo da aplicação.

**Vite 7**  
Build tool moderno que oferece desenvolvimento rápido com Hot Module Replacement (HMR) e build otimizado para produção.

**Lucide React e React Icons**  
Bibliotecas de ícones que proporcionam elementos visuais consistentes e profissionais à interface.

**React Calendar**  
Componente de calendário customizável utilizado na visualização mensal de disponibilidade.

**Recharts**  
Biblioteca de gráficos para React, utilizada na construção de visualizações de dados no dashboard.

**CSS Modular**  
Abordagem de estilização que previne conflitos de estilos e facilita manutenção.

### 5.2. Backend e Infraestrutura

**Firebase Authentication**  
Serviço de autenticação gerenciado que oferece métodos seguros de login, registro, verificação de e-mail e recuperação de senha.

**Firestore Database**  
Banco de dados NoSQL escalável com sincronização em tempo real, ideal para aplicações modernas que requerem atualizações instantâneas.

**Firebase Functions v2**  
Plataforma serverless para execução de código backend em resposta a eventos, eliminando necessidade de gerenciar servidores.

**Firebase Hosting**  
Serviço de hospedagem de aplicações web com CDN global, certificado SSL automático e alta disponibilidade.

**TypeScript**  
Superset do JavaScript que adiciona tipagem estática, aumentando segurança e detectando erros em tempo de desenvolvimento.

### 5.3. Integrações Externas

**Stripe**  
Plataforma de processamento de pagamentos online, utilizada para gerenciamento de assinaturas e cobranças recorrentes.

**Stripe.js**  
Biblioteca JavaScript oficial do Stripe para integração segura de checkout e pagamentos.

### 5.4. Ferramentas de Desenvolvimento

**ESLint**  
Ferramenta de linting que identifica problemas no código e garante consistência com padrões estabelecidos.

**Git**  
Sistema de controle de versão distribuído, fundamental para rastreamento de mudanças e colaboração.

**GitHub**  
Plataforma de hospedagem de repositórios Git, utilizada para versionamento e backup do código.

**Node.js**  
Ambiente de execução JavaScript server-side, utilizado para execução de ferramentas de desenvolvimento e Firebase Functions.

**npm**  
Gerenciador de pacotes do Node.js, utilizado para gerenciar dependências do projeto.

### 5.5. Justificativa das Escolhas Tecnológicas

A seleção do stack tecnológico foi fundamentada em diversos critérios:

- **Escalabilidade:** Firebase oferece arquitetura serverless que escala automaticamente conforme demanda;
- **Segurança:** Firebase Authentication e Firestore Rules fornecem camadas robustas de segurança;
- **Produtividade:** React e Vite permitem desenvolvimento rápido com feedback imediato;
- **Custo:** Modelo de pricing do Firebase é adequado para aplicações em fase inicial;
- **Manutenibilidade:** TypeScript no backend reduz bugs e facilita refatoração;
- **Experiência do Usuário:** React permite construir interfaces fluidas e responsivas;
- **Mercado:** Stack amplamente utilizado na indústria, facilitando empregabilidade.

---

## 6. RELAÇÃO DO PROJETO COM O CURSO DE GRADUAÇÃO

O desenvolvimento deste projeto representa a aplicação prática e integrada de diversos conhecimentos adquiridos ao longo do curso de Engenharia de Software no Instituto INFNET. A seguir, são estabelecidas as correlações entre o projeto e os conteúdos programáticos do curso.

### 6.1. Engenharia de Requisitos

A fase inicial de levantamento e análise de requisitos aplicou conceitos fundamentais de Engenharia de Requisitos, incluindo identificação de stakeholders (médicos e pacientes), elicitação de requisitos funcionais e não funcionais, priorização de funcionalidades e documentação formal de requisitos. A distinção clara entre requisitos essenciais e desejáveis permitiu planejar entregas incrementais.

### 6.2. Arquitetura de Software

O projeto emprega princípios arquiteturais estudados no curso, notadamente:

- **Separação de Responsabilidades:** Divisão clara entre camadas de apresentação, lógica de negócio e dados;
- **Modularização:** Organização do código em módulos independentes e reutilizáveis;
- **Padrão de Projeto:** Implementação de patterns como Container/Presentational Components, Custom Hooks e Service Layer;
- **Arquitetura Serverless:** Utilização de microsserviços escaláveis e desacoplados.

### 6.3. Desenvolvimento Web

Aplicação de conceitos de desenvolvimento frontend e backend:

- **Frontend:** SPA com React, roteamento client-side, gerenciamento de estado, componentização;
- **Backend:** APIs RESTful (Firebase), Functions serverless, webhooks;
- **Comunicação:** Requisições HTTP, promises, async/await, tratamento de erros;
- **Responsividade:** Design adaptável a diferentes dispositivos e tamanhos de tela.

### 6.4. Banco de Dados

Utilização de banco de dados NoSQL (Firestore) aplicando conceitos de:

- **Modelagem de Dados:** Definição de coleções e estrutura de documentos;
- **Queries:** Consultas com filtros, ordenação e limitação de resultados;
- **Índices:** Criação de índices compostos para otimização de queries complexas;
- **Transações:** Embora não implementadas nesta versão, o Firestore suporta transações ACID.

### 6.5. Segurança da Informação

Implementação de práticas de segurança abordadas no curso:

- **Autenticação e Autorização:** Controle de acesso baseado em identidade;
- **Criptografia:** Comunicação HTTPS, armazenamento seguro de senhas (gerenciado pelo Firebase);
- **Validação de Entrada:** Sanitização de dados para prevenir injeções;
- **Princípio do Menor Privilégio:** Regras de acesso restritivas no Firestore;
- **Secrets Management:** Armazenamento seguro de credenciais sensíveis.

### 6.6. Testes de Software

Embora testes automatizados não tenham sido implementados, foram realizados testes funcionais manuais aplicando conceitos de:

- **Testes de Unidade:** Verificação de comportamento de funções isoladas;
- **Testes de Integração:** Validação de comunicação entre módulos;
- **Testes de Sistema:** Verificação de fluxos completos end-to-end;
- **Testes de Aceitação:** Validação de requisitos com usuários reais.

### 6.7. Gestão de Projetos

Aplicação de práticas de gestão de projetos de software:

- **Planejamento:** Definição de escopo, cronograma e entregas;
- **Priorização:** Identificação de funcionalidades essenciais versus desejáveis;
- **Iterações:** Desenvolvimento incremental com validações periódicas;
- **Controle de Versão:** Uso de Git para rastreamento de mudanças;
- **Documentação:** Produção de documentação técnica abrangente.

### 6.8. Engenharia de Software na Prática

O projeto exemplifica o ciclo completo de desenvolvimento de software:

1. **Concepção:** Identificação de problema e proposta de solução;
2. **Análise:** Levantamento e formalização de requisitos;
3. **Projeto:** Modelagem de dados e arquitetura do sistema;
4. **Implementação:** Desenvolvimento de frontend e backend;
5. **Validação:** Testes e correção de bugs;
6. **Implantação:** Deploy em ambiente de produção;
7. **Manutenção:** Monitoramento e correções evolutivas.

### 6.9. Qualidade de Software

Aplicação de práticas de qualidade:

- **Padrões de Código:** Convenções consistentes de nomenclatura e organização;
- **Code Review:** Revisão crítica do próprio código antes de commits;
- **Refatoração:** Melhoria contínua da estrutura do código;
- **Documentação:** Código autodocumentado e documentação técnica detalhada;
- **Linting:** Uso de ferramentas automatizadas para garantir qualidade.

### 6.10. Experiência do Usuário (UX/UI)

Aplicação de princípios de design de interfaces:

- **Usabilidade:** Interface intuitiva que não requer treinamento;
- **Acessibilidade:** Design inclusivo para diferentes perfis de usuários;
- **Consistência:** Elementos visuais e interações padronizadas;
- **Feedback:** Indicações claras de ações e estados do sistema;
- **Responsividade:** Adaptação a diferentes dispositivos.

---

## 7. RESULTADOS OBTIDOS

O desenvolvimento do projeto resultou em uma aplicação funcional, implantada em ambiente de produção e disponível publicamente. Os principais resultados alcançados são descritos a seguir.

### 7.1. Produto Funcional

Foi desenvolvida uma plataforma SaaS completa e operacional que atende aos objetivos estabelecidos. O sistema está em produção no endereço https://etna-agendamento-medico.web.app/ e possui todas as funcionalidades planejadas implementadas e funcionais.

### 7.2. Aplicação Real

O sistema foi validado com usuários reais do domínio de saúde, confirmando sua aplicabilidade prática. O feedback obtido indicou que a ferramenta soluciona de forma efetiva os problemas de agendamento manual, controle de disponibilidade e comunicação com pacientes.

### 7.3. Código Organizado e Documentado

O projeto apresenta estrutura de código bem organizada, seguindo boas práticas de desenvolvimento:

- Mais de 5.000 linhas de código JavaScript/TypeScript;
- Mais de 40 componentes React reutilizáveis;
- 15 custom hooks para lógica de negócio;
- Estrutura de pastas lógica e intuitiva;
- Documentação técnica com mais de 4.000 linhas.

### 7.4. Integração com Serviços Profissionais

Integração bem-sucedida com serviços de nível profissional:

- Firebase Authentication para autenticação segura;
- Firestore para persistência de dados em tempo real;
- Stripe para processamento de pagamentos recorrentes;
- Firebase Hosting com CDN global e certificado SSL.

### 7.5. Sistema de Planos

Implementação de modelo de monetização com dois planos:

- **Plano FREE:** 10 consultas confirmadas por mês;
- **Plano PRO:** Consultas ilimitadas por R$ 49/mês.

O sistema valida automaticamente limites de uso e gerencia upgrades e downgrades de planos.

### 7.6. Interface Profissional

Desenvolvimento de interface moderna e responsiva que proporciona experiência de usuário de qualidade profissional, utilizando componentes reutilizáveis, ícones profissionais, gráficos interativos e design adaptável.

### 7.7. Segurança Implementada

Múltiplas camadas de segurança foram implementadas:

- Autenticação obrigatória para área de médicos;
- Regras de segurança do Firestore protegendo dados;
- Validações server-side em operações críticas;
- Secrets management para credenciais sensíveis;
- Comunicação criptografada via HTTPS.

### 7.8. Repositório Público

O código-fonte está disponível publicamente no GitHub (https://github.com/Abrahao02/Agendamento-medico), permitindo que a comunidade de desenvolvedores possa estudar, aprender e contribuir com o projeto.

### 7.9. Aprendizado Técnico

O desenvolvimento proporcionou aprendizado significativo em:

- Arquitetura serverless e microsserviços;
- Desenvolvimento full-stack moderno;
- Integração com APIs e webhooks;
- Processamento de pagamentos online;
- Deploy e operação de aplicações em produção;
- Modelagem de dados NoSQL;
- Gerenciamento de estado em aplicações React;
- TypeScript e type safety.

### 7.10. Preparação para o Mercado

O projeto desenvolvido representa um portfólio profissional relevante que demonstra:

- Capacidade de desenvolver aplicações completas;
- Conhecimento de tecnologias modernas;
- Aplicação prática de conceitos de Engenharia de Software;
- Experiência com ferramentas e serviços utilizados pela indústria;
- Habilidade de levar um projeto desde a concepção até a produção.

---

## 8. CONCLUSÃO

O desenvolvimento da plataforma SaaS de agendamento médico representa uma aplicação abrangente e prática dos conhecimentos adquiridos ao longo do curso de Engenharia de Software. O projeto transcendeu o âmbito meramente acadêmico, resultando em um produto funcional, implantado em produção e validado por usuários reais do mercado de saúde.

Durante o desenvolvimento, foram exercitadas competências fundamentais para um engenheiro de software, incluindo análise de requisitos, modelagem de dados, arquitetura de sistemas, desenvolvimento frontend e backend, integração com serviços externos, implementação de segurança, testes, deploy e documentação. A complexidade técnica do projeto, aliada à sua aplicabilidade real, evidencia não apenas a compreensão teórica dos conceitos, mas a capacidade de aplicá-los efetivamente na resolução de problemas concretos.

A escolha por tecnologias modernas e amplamente adotadas pela indústria de software (React, Firebase, TypeScript, Stripe) reflete a preocupação em desenvolver soluções alinhadas com as demandas atuais do mercado. A arquitetura serverless adotada demonstra compreensão de tendências contemporâneas de desenvolvimento, priorizando escalabilidade, economia de recursos e foco em lógica de negócio.

A documentação técnica produzida, totalizando mais de 4.000 linhas, exemplifica o compromisso com boas práticas de desenvolvimento, facilitando manutenção futura e transferência de conhecimento. Esta preocupação com manutenibilidade e qualidade de código reflete maturidade profissional e compreensão de que software de qualidade transcende funcionalidade, englobando também legibilidade, documentação e sustentabilidade a longo prazo.

O projeto também demonstrou capacidade de gestão de complexidade, organizando um sistema com múltiplas funcionalidades, diversos módulos interdependentes e integrações externas em uma estrutura coerente e bem arquitetada. A separação clara de responsabilidades entre componentes, a reutilização de código e a modularização evidenciam aplicação de princípios fundamentais de Engenharia de Software.

Por fim, a implementação de um modelo de negócio (sistema de planos e assinaturas) agregou uma dimensão empreendedora ao projeto, demonstrando compreensão de que soluções de software bem-sucedidas não apenas resolvem problemas técnicos, mas também apresentam viabilidade comercial e sustentabilidade financeira.

Em síntese, o projeto representa uma síntese prática e significativa da formação em Engenharia de Software, demonstrando capacidade de conceber, projetar, implementar e implantar sistemas de software completos e funcionais que solucionam necessidades reais do mercado.

---

## 9. JUSTIFICATIVA PARA ENQUADRAMENTO COMO ATIVIDADE EXTRAORDINÁRIA

A presente atividade deve ser enquadrada na categoria "Atividade Extraordinária, não prevista nos itens anteriores" pelos seguintes motivos:

### 9.1. Natureza Extraordinária da Atividade

Diferentemente de atividades acadêmicas convencionais (disciplinas, trabalhos de conclusão de curso, projetos integradores), este desenvolvimento caracteriza-se como iniciativa autônoma, voluntária e extraordinária, motivada exclusivamente pelo desejo de aplicar conhecimentos em contexto real e desenvolver competências práticas complementares à formação teórica.

### 9.2. Complexidade Técnica

O projeto apresenta complexidade técnica significativa, envolvendo:

- Desenvolvimento full-stack com frontend e backend;
- Integração com múltiplos serviços externos (autenticação, banco de dados, pagamentos);
- Implementação de lógica de negócio complexa (validações, limitações, cálculos);
- Gerenciamento de estado em aplicação de grande porte;
- Configuração de segurança em múltiplas camadas;
- Deploy e operação em ambiente de produção.

Esta complexidade transcende significativamente o escopo de exercícios acadêmicos tradicionais, aproximando-se de projetos profissionais reais.

### 9.3. Aplicabilidade Real

O sistema não se configura como protótipo ou exercício acadêmico, mas como aplicação funcional implantada em produção e validada por usuários reais. Esta característica diferencia o projeto de trabalhos meramente teóricos ou conceituais, conferindo-lhe relevância prática e impacto concreto.

### 9.4. Amplitude de Conhecimentos Aplicados

O desenvolvimento exigiu aplicação integrada de conhecimentos de múltiplas áreas:

- Engenharia de Requisitos;
- Arquitetura de Software;
- Desenvolvimento Web (Frontend e Backend);
- Banco de Dados;
- Segurança da Informação;
- Testes de Software;
- Gestão de Projetos;
- Qualidade de Software;
- Experiência do Usuário.

Esta transversalidade demonstra capacidade de integrar conhecimentos diversos na solução de problemas complexos.

### 9.5. Autonomia e Iniciativa

O projeto foi concebido, planejado, desenvolvido e implantado de forma completamente autônoma, sem orientação formal ou cumprimento de requisitos acadêmicos específicos. Esta autonomia evidencia iniciativa, autodidatismo e capacidade de autogestão, competências essenciais para o profissional de Engenharia de Software.

### 9.6. Documentação Abrangente

A produção de documentação técnica detalhada (mais de 4.000 linhas) representa esforço adicional significativo, demonstrando preocupação com compartilhamento de conhecimento, facilitação de manutenção futura e profissionalismo.

### 9.7. Relevância para Formação Profissional

A experiência de desenvolver um projeto completo, desde a concepção até a implantação em produção, proporciona aprendizado prático inestimável que complementa a formação teórica acadêmica, preparando o aluno para desafios reais do mercado de trabalho.

### 9.8. Disponibilização Pública

A disponibilização do código-fonte em repositório público (GitHub) e da aplicação em produção permite que a comunidade acadêmica e profissional acesse, estude e aprenda com o trabalho desenvolvido, multiplicando o impacto educacional do projeto.

### 9.9. Alinhamento com Objetivos das Atividades Complementares

As atividades complementares visam enriquecer a formação do aluno com experiências diversificadas que complementem o currículo regular. Este projeto atende plenamente a este objetivo, proporcionando experiência prática de desenvolvimento de software que não seria possível obter exclusivamente através de disciplinas teóricas.

### 9.10. Carga Horária Compatível

O desenvolvimento demandou aproximadamente 60 horas de trabalho, distribuídas entre levantamento de requisitos, modelagem, desenvolvimento, testes, deploy e documentação. Esta carga horária é compatível com as 50 horas solicitadas para validação, considerando que parte do tempo foi dedicado a experimentação e aprendizado não computado.

---

## 10. DECLARAÇÃO DE CARGA HORÁRIA

Declaro, para os devidos fins, que dediquei aproximadamente 60 horas ao desenvolvimento do projeto "Sistema de Agendamento Médico – Plataforma SaaS", no período compreendido entre dezembro de 2025 e janeiro de 2026, distribuídas conforme discriminação a seguir:

| Atividade | Horas |
|-----------|-------|
| Levantamento e Análise de Requisitos | 6h |
| Modelagem de Dados e Arquitetura | 8h |
| Desenvolvimento do Frontend | 18h |
| Desenvolvimento do Backend | 10h |
| Integração com Serviços Externos | 4h |
| Implementação de Segurança | 3h |
| Testes e Validação | 4h |
| Deploy e Configuração de Produção | 3h |
| Documentação Técnica | 4h |
| **TOTAL** | **60h** |

Solicito, portanto, a validação de **50 horas** na categoria **"Atividade Extraordinária, não prevista nos itens anteriores"**, para cumprimento parcial da carga horária de atividades complementares exigida pelo curso de Engenharia de Software do Instituto INFNET.

---

## ANEXOS

### Anexo A - Links de Acesso

**Aplicação em Produção:**  
https://etna-agendamento-medico.web.app/

**Repositório GitHub:**  
https://github.com/Abrahao02/Agendamento-medico

### Anexo B - Evidências Técnicas

- Código-fonte disponível publicamente no GitHub
- Documentação técnica completa no diretório `src/docs/`
- README.md com mais de 650 linhas documentando o projeto
- Aplicação funcional e acessível online

### Anexo C - Estrutura do Projeto

A estrutura completa do projeto, incluindo todos os diretórios, arquivos, componentes, hooks, serviços e utilitários, está disponível no repositório GitHub mencionado acima.

---

**Local e Data:** Rio de Janeiro, 15 de janeiro de 2026

**Aluno:** Eduardo de Sá Abrahão  
**Curso:** Engenharia de Software  
**Instituição:** Instituto INFNET

---

_Este relatório foi elaborado em conformidade com as normas acadêmicas para validação de atividades complementares, apresentando de forma clara, objetiva e documentada o desenvolvimento de um projeto de software real como atividade extraordinária complementar à formação em Engenharia de Software._
