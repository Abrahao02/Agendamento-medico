import { useNavigate } from "react-router-dom";
import "./LegalPage.css";

export default function TermsOfUse() {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <div className="legal-container">
                <button className="legal-back-button" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <header className="legal-header">
                    <h1>Termos de Uso da Plataforma</h1>
                    <p className="legal-version">Versão 1.1.0 | Última atualização: 27 de janeiro de 2026</p>
                </header>

                <div className="legal-content">
                    <section>
                        <h2>1. Sobre a Plataforma</h2>
                        <p>
                            Bem-vindo à nossa plataforma de agendamento para profissionais de saúde. Somos uma ferramenta digital que conecta
                            profissionais de saúde aos seus pacientes, facilitando o agendamento de consultas e atendimentos.
                        </p>
                        <p>
                            <strong>Importante:</strong> Não somos uma clínica, hospital ou prestadora de serviços de saúde.
                            Atuamos exclusivamente como intermediadora tecnológica entre profissionais de saúde e pacientes.
                        </p>
                    </section>

                    <section>
                        <h2>2. Aceitação dos Termos</h2>
                        <p>
                            Ao criar uma conta e utilizar nossa plataforma, você concorda com estes Termos de Uso.
                            Se você não concorda com qualquer parte destes termos, não utilize nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2>3. Quem Pode Usar</h2>
                        <p>
                            <strong>Profissionais de Saúde:</strong> Profissionais com registro ativo em seus respectivos
                            conselhos de classe podem criar contas para gerenciar sua agenda e receber agendamentos.
                            Isso inclui, mas não se limita a:
                        </p>
                        <ul>
                            <li><strong>Médicos:</strong> Registro no CRM (Conselho Regional de Medicina)</li>
                            <li><strong>Nutricionistas:</strong> Registro no CRN (Conselho Regional de Nutrição)</li>
                            <li><strong>Psicólogos:</strong> Registro no CRP (Conselho Regional de Psicologia)</li>
                            <li><strong>Fisioterapeutas e Terapeutas Ocupacionais:</strong> Registro no CREFITO</li>
                            <li><strong>Enfermeiros:</strong> Registro no COREN (Conselho Regional de Enfermagem)</li>
                            <li><strong>Dentistas:</strong> Registro no CRO (Conselho Regional de Odontologia)</li>
                            <li><strong>Farmacêuticos:</strong> Registro no CRF (Conselho Regional de Farmácia)</li>
                            <li><strong>Fonoaudiólogos:</strong> Registro no CREFONO</li>
                            <li><strong>Biomédicos:</strong> Registro no CRBM</li>
                            <li><strong>Profissionais de Educação Física:</strong> Registro no CREF</li>
                        </ul>
                        <p>
                            <strong>Pacientes:</strong> Qualquer pessoa pode agendar consultas através dos links públicos
                            disponibilizados pelos profissionais cadastrados.
                        </p>
                    </section>

                    <section>
                        <h2>4. Responsabilidades da Plataforma</h2>
                        <p>Nós nos comprometemos a:</p>
                        <ul>
                            <li>Fornecer uma ferramenta funcional para agendamento de consultas e atendimentos</li>
                            <li>Proteger os dados pessoais conforme a Lei Geral de Proteção de Dados (LGPD)</li>
                            <li>Manter a plataforma disponível e segura dentro das melhores práticas</li>
                            <li>Processar pagamentos de assinaturas de forma segura através de parceiros certificados (Stripe)</li>
                        </ul>
                        <p>
                            <strong>Limitações:</strong> Não nos responsabilizamos por:
                        </p>
                        <ul>
                            <li>Qualidade, diagnóstico ou tratamento oferecido pelos profissionais de saúde</li>
                            <li>Decisões clínicas ou recomendações feitas durante os atendimentos</li>
                            <li>Cancelamentos ou alterações de horários por parte dos profissionais</li>
                            <li>Indisponibilidade temporária do serviço por manutenção ou problemas técnicos</li>
                            <li>Conteúdo gerado pelos usuários (descrições, imagens de perfil, etc.)</li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Responsabilidades do Profissional de Saúde</h2>
                        <p>Ao cadastrar-se como profissional de saúde, você declara e garante que:</p>
                        <ul>
                            <li>Possui registro ativo e regular no conselho de classe correspondente à sua profissão</li>
                            <li>É o único responsável pelo atendimento prestado aos pacientes</li>
                            <li>Cumprirá o Código de Ética da sua profissão e legislação vigente</li>
                            <li>Manterá o sigilo profissional sobre informações dos pacientes</li>
                            <li>Forneceu informações verdadeiras e atualizadas em seu perfil</li>
                            <li>Gerenciará sua agenda e disponibilidade de forma responsável</li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Responsabilidades do Paciente</h2>
                        <p>Ao agendar um atendimento, você se compromete a:</p>
                        <ul>
                            <li>Fornecer informações verdadeiras e atualizadas</li>
                            <li>Comparecer no horário agendado ou cancelar com antecedência</li>
                            <li>Respeitar as políticas de cancelamento estabelecidas pelo profissional</li>
                            <li>Não utilizar a plataforma para fins fraudulentos ou ilegais</li>
                        </ul>
                    </section>

                    <section>
                        <h2>7. Pagamentos e Assinaturas</h2>
                        <p>
                            A plataforma oferece planos de assinatura para profissionais de saúde (Plano Pro).
                            Os pagamentos são processados de forma segura através do Stripe, utilizando cartão de crédito.
                        </p>
                        <p>
                            Os valores dos atendimentos são definidos exclusivamente pelos profissionais de saúde e
                            são negociados diretamente entre profissional e paciente, fora da plataforma.
                        </p>
                        <p>
                            Políticas de cancelamento de atendimentos seguem as regras estabelecidas por cada profissional e
                            as normas de defesa do consumidor brasileiro.
                        </p>
                    </section>

                    <section>
                        <h2>8. Propriedade Intelectual</h2>
                        <p>
                            Todo o conteúdo da plataforma (código, design, textos, logos) é de nossa propriedade ou
                            licenciado para nosso uso. Você não pode copiar, modificar ou distribuir qualquer parte
                            da plataforma sem autorização prévia.
                        </p>
                    </section>

                    <section>
                        <h2>9. Suspensão e Cancelamento de Conta</h2>
                        <p>
                            Reservamo-nos o direito de suspender ou cancelar contas que:
                        </p>
                        <ul>
                            <li>Violem estes Termos de Uso</li>
                            <li>Utilizem a plataforma para atividades ilegais ou antiéticas</li>
                            <li>Apresentem comportamento abusivo com outros usuários</li>
                            <li>Forneçam informações falsas ou fraudulentas</li>
                        </ul>
                    </section>

                    <section>
                        <h2>10. Modificações nos Termos</h2>
                        <p>
                            Podemos atualizar estes Termos de Uso periodicamente. Quando isso acontecer, você será
                            notificado através da plataforma. O uso continuado após as mudanças constitui aceitação
                            dos novos termos.
                        </p>
                    </section>

                    <section>
                        <h2>11. Lei Aplicável</h2>
                        <p>
                            Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa
                            será resolvida no foro da comarca do usuário, conforme determina o Código de Defesa do Consumidor.
                        </p>
                    </section>

                    <section>
                        <h2>12. Contato</h2>
                        <p>
                            Para dúvidas, sugestões ou solicitações relacionadas a estes Termos de Uso, entre em contato
                            através da seção de Configurações da plataforma ou pelo email de suporte.
                        </p>
                    </section>
                </div>

                <footer className="legal-footer">
                    <p><strong>Última atualização:</strong> 27 de janeiro de 2026</p>
                    <p><strong>Versão:</strong> 1.1.0</p>
                </footer>
            </div>
        </div>
    );
}
