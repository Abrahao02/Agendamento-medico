import { useNavigate } from "react-router-dom";
import "./LegalPage.css";

export default function DoctorResponsibility() {
    const navigate = useNavigate();

    return (
        <div className="legal-page">
            <div className="legal-container">
                <button className="legal-back-button" onClick={() => navigate(-1)}>
                    ← Voltar
                </button>

                <header className="legal-header">
                    <h1>Termo de Responsabilidade do Profissional de Saúde</h1>
                    <p className="legal-version">Versão 1.1.0 | Última atualização: 27 de janeiro de 2026</p>
                </header>

                <div className="legal-content">
                    <section>
                        <h2>Declaração de Responsabilidade Profissional</h2>
                        <p>
                            Ao criar uma conta como profissional de saúde nesta plataforma, você declara, sob as penas da lei,
                            estar ciente e de pleno acordo com as responsabilidades descritas neste termo.
                        </p>
                    </section>

                    <section>
                        <h2>1. Natureza da Plataforma</h2>
                        <p>
                            Eu compreendo e declaro que:
                        </p>
                        <ul>
                            <li>
                                A plataforma é exclusivamente uma <strong>ferramenta de agendamento e organização de atendimentos</strong>
                            </li>
                            <li>
                                A plataforma <strong>não presta, não intermedia e não se responsabiliza</strong> por qualquer
                                serviço de saúde, diagnóstico, tratamento ou orientação profissional
                            </li>
                            <li>
                                A plataforma <strong>não possui</strong> vínculo empregatício, societário ou de parceria
                                profissional comigo
                            </li>
                            <li>
                                Sou um <strong>profissional autônomo</strong> que utiliza a plataforma como ferramenta
                                tecnológica para gestão da minha agenda
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>2. Responsabilidade Exclusiva pelos Serviços Prestados</h2>
                        <p>
                            Eu declaro que sou <strong>inteiramente responsável</strong> por:
                        </p>
                        <ul>
                            <li>
                                Todos os atendimentos prestados aos pacientes que agendarem através da plataforma
                            </li>
                            <li>
                                Avaliações, orientações, prescrições (quando aplicável) e procedimentos realizados
                            </li>
                            <li>
                                Consequências diretas ou indiretas dos tratamentos recomendados ou realizados
                            </li>
                            <li>
                                Decisões profissionais tomadas durante o atendimento aos pacientes
                            </li>
                            <li>
                                Qualquer erro, omissão ou negligência no exercício da minha profissão
                            </li>
                            <li>
                                Manutenção de prontuários e documentação adequada conforme exigido pelo meu conselho de classe
                            </li>
                        </ul>
                        <p>
                            <strong>A plataforma não possui qualquer responsabilidade sobre aspectos técnicos,
                                clínicos ou éticos relacionados aos atendimentos.</strong>
                        </p>
                    </section>

                    <section>
                        <h2>3. Registro Profissional e Habilitação Legal</h2>
                        <p>
                            Eu declaro e garanto que:
                        </p>
                        <ul>
                            <li>
                                Possuo <strong>registro ativo e regular</strong> no conselho de classe correspondente à minha
                                profissão (CRM, CRN, CRP, CREFITO, COREN, CRO, CRF, CREFONO, CRBM, CREF ou equivalente)
                            </li>
                            <li>
                                Meu registro profissional <strong>não está suspenso, cassado ou com restrições</strong>
                                que impeçam o exercício da minha profissão
                            </li>
                            <li>
                                Estou legalmente habilitado para exercer minha profissão no Brasil
                            </li>
                            <li>
                                Mantenho em dia todas as obrigações junto ao meu conselho de classe, incluindo anuidades e
                                requisitos de educação continuada
                            </li>
                            <li>
                                Comunicarei imediatamente à plataforma qualquer alteração no status do meu registro
                                profissional
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>4. Código de Ética Profissional</h2>
                        <p>
                            Eu me comprometo a:
                        </p>
                        <ul>
                            <li>
                                Cumprir rigorosamente o <strong>Código de Ética</strong> do meu conselho de classe
                            </li>
                            <li>
                                Respeitar os princípios fundamentais da minha profissão, incluindo beneficência, não maleficência,
                                autonomia do paciente e justiça
                            </li>
                            <li>
                                Atender todos os pacientes com o mesmo zelo e cuidado, sem discriminação de qualquer natureza
                            </li>
                            <li>
                                Agir sempre no melhor interesse do paciente, priorizando sua saúde e bem-estar
                            </li>
                            <li>
                                Atuar exclusivamente dentro dos limites da minha competência profissional
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>5. Sigilo Profissional e Confidencialidade</h2>
                        <p>
                            Eu me comprometo a:
                        </p>
                        <ul>
                            <li>
                                Manter <strong>sigilo absoluto</strong> sobre todas as informações dos pacientes,
                                conforme determina o código de ética da minha profissão
                            </li>
                            <li>
                                Proteger a confidencialidade dos dados dos pacientes em todas as circunstâncias,
                                exceto quando houver obrigação legal ou consentimento expresso do paciente
                            </li>
                            <li>
                                Não compartilhar informações de consultas, avaliações ou tratamentos através da plataforma
                                ou qualquer outro meio não seguro
                            </li>
                            <li>
                                Utilizar a plataforma apenas para agendamento e comunicação administrativa,
                                <strong> nunca para discutir questões clínicas sensíveis</strong>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>6. Responsabilidade Civil e Penal</h2>
                        <p>
                            Eu reconheço que:
                        </p>
                        <ul>
                            <li>
                                Sou <strong>civilmente responsável</strong> por danos causados aos pacientes decorrentes
                                de erro profissional, imperícia, imprudência ou negligência
                            </li>
                            <li>
                                Sou <strong>penalmente responsável</strong> por crimes cometidos no exercício da minha
                                profissão
                            </li>
                            <li>
                                É recomendável possuir <strong>seguro de responsabilidade civil profissional</strong> adequado à
                                minha área de atuação
                            </li>
                            <li>
                                A plataforma <strong>não assume</strong> qualquer responsabilidade civil, criminal ou ética
                                por meus atos profissionais
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>7. Gestão de Agenda e Atendimento aos Pacientes</h2>
                        <p>
                            Eu me comprometo a:
                        </p>
                        <ul>
                            <li>
                                Manter minha <strong>agenda atualizada</strong> na plataforma, informando corretamente
                                minha disponibilidade
                            </li>
                            <li>
                                <strong>Honrar os agendamentos</strong> realizados através da plataforma, comparecendo
                                pontualmente aos atendimentos
                            </li>
                            <li>
                                Em caso de impossibilidade de atendimento, <strong>avisar os pacientes</strong> com
                                antecedência razoável
                            </li>
                            <li>
                                Tratar todos os pacientes com <strong>respeito, dignidade e profissionalismo</strong>
                            </li>
                            <li>
                                Definir políticas claras de cancelamento e reembolso
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>8. Informações Prestadas na Plataforma</h2>
                        <p>
                            Eu declaro que:
                        </p>
                        <ul>
                            <li>
                                Todas as informações fornecidas no meu perfil (nome, registro profissional, especialidade, formação)
                                são <strong>verdadeiras e verificáveis</strong>
                            </li>
                            <li>
                                Não farei <strong>propaganda enganosa</strong> ou promessas de resultados que não posso garantir
                            </li>
                            <li>
                                Respeitarei as normas do meu conselho de classe sobre publicidade profissional
                            </li>
                            <li>
                                Atualizarei meu perfil sempre que houver mudanças relevantes
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>9. Proteção de Dados dos Pacientes (LGPD)</h2>
                        <p>
                            Eu me comprometo a:
                        </p>
                        <ul>
                            <li>
                                Tratar os dados pessoais e de saúde dos pacientes em conformidade com a
                                <strong> Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018)</strong>
                            </li>
                            <li>
                                Utilizar os dados dos pacientes <strong>exclusivamente para finalidades</strong>
                                legítimas e autorizadas relacionadas ao atendimento
                            </li>
                            <li>
                                Implementar medidas de segurança adequadas para proteger os dados dos pacientes
                            </li>
                            <li>
                                Respeitar os direitos dos pacientes sobre seus dados (acesso, correção, exclusão)
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>10. Isenção de Responsabilidade da Plataforma</h2>
                        <p>
                            Eu reconheço e concordo expressamente que:
                        </p>
                        <ul>
                            <li>
                                A plataforma <strong>não será responsabilizada</strong> por qualquer reclamação, processo,
                                sanção ou indenização decorrente dos serviços que presto
                            </li>
                            <li>
                                Em caso de processos judiciais ou administrativos relacionados aos meus atendimentos,
                                a plataforma <strong>não é parte legítima</strong> para figurar como ré
                            </li>
                            <li>
                                Eventuais disputas com pacientes são de <strong>minha exclusiva responsabilidade</strong>
                            </li>
                            <li>
                                <strong>Indenizarei</strong> a plataforma por quaisquer custos, danos ou prejuízos que ela
                                venha a sofrer em decorrência de ações ou omissões relacionadas aos meus serviços
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2>11. Suspensão ou Encerramento de Conta</h2>
                        <p>
                            Eu compreendo que minha conta poderá ser suspensa ou encerrada se:
                        </p>
                        <ul>
                            <li>Meu registro profissional for suspenso, cassado ou tornar-se irregular</li>
                            <li>Eu violar este Termo de Responsabilidade ou os Termos de Uso da plataforma</li>
                            <li>Houver denúncias graves ou recorrentes de má conduta profissional</li>
                            <li>Eu fornecer informações falsas ou fraudulentas</li>
                        </ul>
                    </section>

                    <section>
                        <h2>12. Declaração Final</h2>
                        <p>
                            Ao aceitar este termo, eu declaro que:
                        </p>
                        <ul>
                            <li>Li, compreendi e concordo com todas as condições acima</li>
                            <li>Estou ciente das minhas responsabilidades profissionais, éticas e legais</li>
                            <li>Utilizarei a plataforma de forma responsável e em conformidade com a legislação vigente</li>
                            <li>Assumo integralmente a responsabilidade pelos serviços que presto aos pacientes</li>
                        </ul>
                    </section>
                </div>

                <footer className="legal-footer">
                    <p><strong>Última atualização:</strong> 27 de janeiro de 2026</p>
                    <p><strong>Versão:</strong> 1.1.0</p>
                    <p><strong>Legislação aplicável:</strong> Códigos de Ética dos Conselhos Profissionais, Lei nº 13.709/2018 (LGPD)</p>
                </footer>
            </div>
        </div>
    );
}
