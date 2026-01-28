import { useNavigate } from "react-router-dom";
import "./LegalPage.css";

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <div className="legal-container">
                <button className="legal-back-button" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <header className="legal-header">
                    <h1>Política de Privacidade</h1>
                    <p className="legal-version">Versão 1.1.0 | Última atualização: 27 de janeiro de 2026</p>
                </header>

                <div className="legal-content">
                    <section>
                        <h2>1. Introdução</h2>
                        <p>
                            Esta Política de Privacidade explica como coletamos, usamos, armazenamos e protegemos seus dados
                            pessoais, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD).
                        </p>
                        <p>
                            Levamos sua privacidade a sério e nos comprometemos a tratar seus dados com total transparência,
                            segurança e respeito aos seus direitos.
                        </p>
                    </section>

                    <section>
                        <h2>2. Quem Somos</h2>
                        <p>
                            Somos uma plataforma de agendamento que conecta profissionais de saúde e pacientes.
                            Para os fins desta política, somos o <strong>Controlador</strong> dos dados pessoais coletados
                            através da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2>3. Dados Coletados</h2>

                        <h3>3.1. Dados Pessoais de Profissionais de Saúde</h3>
                        <ul>
                            <li><strong>Identificação:</strong> Nome completo, CPF, registro profissional (CRM, CRN, CRP, CREFITO, COREN, CRO, CRF, CREFONO, CRBM, CREF ou equivalente)</li>
                            <li><strong>Contato:</strong> Email, número de WhatsApp</li>
                            <li><strong>Profissionais:</strong> Especialidade/área de atuação, horários de atendimento, locais de atendimento</li>
                            <li><strong>Técnicos:</strong> Endereço IP, logs de acesso, cookies</li>
                        </ul>

                        <h3>3.2. Dados Pessoais de Pacientes</h3>
                        <ul>
                            <li><strong>Identificação:</strong> Nome completo</li>
                            <li><strong>Contato:</strong> Email, telefone/WhatsApp</li>
                            <li><strong>Agendamento:</strong> Data/hora do atendimento, motivo da consulta</li>
                            <li><strong>Técnicos:</strong> Endereço IP, logs de acesso</li>
                        </ul>

                        <h3>3.3. Dados Sensíveis</h3>
                        <p>
                            <strong>Importante:</strong> Conforme Art. 11 da LGPD, consideramos <strong>dados sensíveis</strong>
                            as informações relacionadas à saúde, como:
                        </p>
                        <ul>
                            <li>Motivo da consulta ou sintomas informados pelo paciente</li>
                            <li>Histórico de agendamentos</li>
                            <li>Informações de saúde compartilhadas durante o agendamento</li>
                        </ul>
                        <p>
                            O tratamento de dados sensíveis ocorre apenas com seu <strong>consentimento específico</strong>
                            e para finalidades legítimas (agendamento e prestação de serviços de saúde).
                        </p>
                    </section>

                    <section>
                        <h2>4. Como Usamos Seus Dados</h2>

                        <h3>4.1. Base Legal (LGPD)</h3>
                        <p>Tratamos seus dados com base nas seguintes hipóteses legais:</p>
                        <ul>
                            <li><strong>Consentimento:</strong> Para dados sensíveis de saúde (Art. 11, I, LGPD)</li>
                            <li><strong>Execução de contrato:</strong> Para processar agendamentos e assinaturas (Art. 7º, V)</li>
                            <li><strong>Obrigação legal:</strong> Para cumprir exigências fiscais e regulatórias (Art. 7º, II)</li>
                            <li><strong>Legítimo interesse:</strong> Para melhorar nossos serviços e segurança (Art. 7º, IX)</li>
                        </ul>

                        <h3>4.2. Finalidades</h3>
                        <ul>
                            <li>Criar e gerenciar sua conta na plataforma</li>
                            <li>Processar agendamentos de consultas e atendimentos</li>
                            <li>Facilitar a comunicação entre profissionais de saúde e pacientes</li>
                            <li>Processar pagamentos de assinaturas de forma segura (via Stripe)</li>
                            <li>Enviar notificações importantes sobre sua conta ou agendamentos</li>
                            <li>Melhorar a experiência do usuário e funcionalidades da plataforma</li>
                            <li>Prevenir fraudes e garantir a segurança da plataforma</li>
                            <li>Cumprir obrigações legais e regulatórias</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Compartilhamento de Dados</h2>
                        <p>Seus dados podem ser compartilhados com:</p>

                        <h3>5.1. Entre Profissionais de Saúde e Pacientes</h3>
                        <p>
                            Informações necessárias para o agendamento (nome, contato, data/hora) são compartilhadas
                            entre profissional e paciente para viabilizar o atendimento.
                        </p>

                        <h3>5.2. Prestadores de Serviço</h3>
                        <ul>
                            <li><strong>Firebase (Google):</strong> Armazenamento de dados e autenticação</li>
                            <li><strong>Stripe:</strong> Processamento de pagamentos de assinaturas</li>
                            <li><strong>Serviços de Email/SMS:</strong> Envio de notificações</li>
                        </ul>
                        <p>
                            Todos os parceiros são cuidadosamente selecionados e comprometidos com a proteção de dados.
                        </p>

                        <h3>5.3. Autoridades</h3>
                        <p>
                            Podemos compartilhar dados com autoridades governamentais quando exigido por lei ou ordem judicial.
                        </p>

                        <h3>5.4. Não Vendemos Seus Dados</h3>
                        <p>
                            <strong>Garantimos:</strong> Nunca vendemos, alugamos ou comercializamos seus dados pessoais
                            para terceiros com fins de marketing.
                        </p>
                    </section>

                    <section>
                        <h2>6. Seus Direitos (LGPD)</h2>
                        <p>De acordo com a LGPD, você tem os seguintes direitos:</p>
                        <ul>
                            <li><strong>Confirmação e Acesso:</strong> Saber se tratamos seus dados e solicitar cópia</li>
                            <li><strong>Correção:</strong> Atualizar dados incompletos, inexatos ou desatualizados</li>
                            <li><strong>Anonimização ou Exclusão:</strong> Solicitar remoção de dados desnecessários ou tratados indevidamente</li>
                            <li><strong>Portabilidade:</strong> Receber seus dados em formato estruturado e legível</li>
                            <li><strong>Informação sobre Compartilhamento:</strong> Saber com quem compartilhamos seus dados</li>
                            <li><strong>Revogação do Consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
                            <li><strong>Oposição:</strong> Opor-se ao tratamento realizado sem seu consentimento</li>
                        </ul>
                        <p>
                            Para exercer seus direitos, acesse a seção de Configurações da plataforma ou entre em contato
                            através do nosso canal de atendimento.
                        </p>
                    </section>

                    <section>
                        <h2>7. Segurança dos Dados</h2>
                        <p>Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
                        <ul>
                            <li>Criptografia de dados em trânsito (HTTPS/SSL)</li>
                            <li>Armazenamento seguro em servidores certificados</li>
                            <li>Controle de acesso restrito aos dados</li>
                            <li>Monitoramento de atividades suspeitas</li>
                            <li>Backups regulares para prevenir perda de dados</li>
                            <li>Treinamento da equipe sobre proteção de dados</li>
                        </ul>
                        <p>
                            Apesar de nossos esforços, nenhum sistema é 100% seguro. Incentivamos você a proteger
                            suas credenciais de acesso e reportar qualquer atividade suspeita imediatamente.
                        </p>
                    </section>

                    <section>
                        <h2>8. Retenção de Dados</h2>
                        <p>Mantemos seus dados pelo tempo necessário para:</p>
                        <ul>
                            <li>Cumprir as finalidades para as quais foram coletados</li>
                            <li>Atender obrigações legais (ex: fiscais, trabalhistas)</li>
                            <li>Resolver disputas e fazer cumprir nossos acordos</li>
                        </ul>
                        <p>
                            Dados de agendamentos podem ser mantidos por até <strong>5 anos</strong> para fins de
                            auditoria e conformidade regulatória. Após esse período, dados são anonimizados ou excluídos.
                        </p>
                    </section>

                    <section>
                        <h2>9. Cookies e Tecnologias Similares</h2>
                        <p>
                            Utilizamos cookies e tecnologias similares para melhorar sua experiência, incluindo:
                        </p>
                        <ul>
                            <li><strong>Cookies essenciais:</strong> Necessários para o funcionamento da plataforma</li>
                            <li><strong>Cookies de funcionalidade:</strong> Lembrar suas preferências</li>
                            <li><strong>Cookies analíticos:</strong> Entender como você usa a plataforma</li>
                        </ul>
                        <p>
                            Você pode gerenciar cookies através das configurações do seu navegador, mas isso pode
                            afetar algumas funcionalidades da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2>10. Transferência Internacional de Dados</h2>
                        <p>
                            Alguns de nossos prestadores de serviço (Firebase, Stripe) podem armazenar dados em
                            servidores localizados fora do Brasil. Garantimos que essas transferências seguem
                            os requisitos da LGPD e que seus dados continuam protegidos.
                        </p>
                    </section>

                    <section>
                        <h2>11. Menores de Idade</h2>
                        <p>
                            Nossa plataforma não é destinada a menores de 18 anos. Pais ou responsáveis devem
                            realizar agendamentos em nome de menores e fornecer consentimento para tratamento
                            de seus dados.
                        </p>
                    </section>

                    <section>
                        <h2>12. Atualizações desta Política</h2>
                        <p>
                            Podemos atualizar esta Política de Privacidade periodicamente. Mudanças significativas
                            serão comunicadas através da plataforma ou por email. Recomendamos revisar esta página
                            regularmente.
                        </p>
                    </section>

                    <section>
                        <h2>13. Contato e Encarregado de Dados</h2>
                        <p>
                            Para questões sobre privacidade, exercício de direitos ou reclamações, entre em contato:
                        </p>
                        <ul>
                            <li><strong>Email:</strong> Disponível nas Configurações da plataforma</li>
                            <li><strong>Autoridade Nacional:</strong> Você também pode contatar a ANPD (Autoridade Nacional
                                de Proteção de Dados) em <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer">
                                    www.gov.br/anpd</a></li>
                        </ul>
                    </section>
                </div>

                <footer className="legal-footer">
                    <p><strong>Última atualização:</strong> 27 de janeiro de 2026</p>
                    <p><strong>Versão:</strong> 1.1.0</p>
                    <p><strong>Legislação aplicável:</strong> Lei nº 13.709/2018 (LGPD)</p>
                </footer>
            </div>
        </div>
    );
}
