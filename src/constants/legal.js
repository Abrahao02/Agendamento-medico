/**
 * ============================================
 * CONSTANTES DE TERMOS LEGAIS
 * ============================================
 *
 * Gerencia versionamento dos documentos legais da plataforma.
 *
 * IMPORTANTE: Ao atualizar qualquer termo:
 * 1. Incremente a versão (ex: 1.0.0 → 1.1.0)
 * 2. Atualize LAST_UPDATED
 * 3. Considere se é necessário solicitar re-aceite dos usuários
 */

export const TERMS_VERSION = "1.1.0";
export const LAST_UPDATED = "2026-01-27";

export const LEGAL_VERSIONS = {
    termsOfUse: {
        version: "1.1.0",
        lastUpdated: "2026-01-27",
    },
    privacyPolicy: {
        version: "1.1.0",
        lastUpdated: "2026-01-27",
    },
    doctorResponsibility: {
        version: "1.1.0",
        lastUpdated: "2026-01-27",
    },
};

export const LEGAL_ROUTES = {
    terms: "/termos-de-uso",
    privacy: "/politica-de-privacidade",
    doctorResponsibility: "/termo-de-responsabilidade-medico",
};

/**
 * Lista de tipos de profissionais de saúde aceitos na plataforma
 */
export const HEALTH_PROFESSIONAL_TYPES = [
    { value: "medico", label: "Médico(a)", council: "CRM" },
    { value: "nutricionista", label: "Nutricionista", council: "CRN" },
    { value: "psicologo", label: "Psicólogo(a)", council: "CRP" },
    { value: "fisioterapeuta", label: "Fisioterapeuta", council: "CREFITO" },
    { value: "terapeuta_ocupacional", label: "Terapeuta Ocupacional", council: "CREFITO" },
    { value: "enfermeiro", label: "Enfermeiro(a)", council: "COREN" },
    { value: "dentista", label: "Dentista", council: "CRO" },
    { value: "farmaceutico", label: "Farmacêutico(a)", council: "CRF" },
    { value: "fonoaudiologo", label: "Fonoaudiólogo(a)", council: "CREFONO" },
    { value: "biomedico", label: "Biomédico(a)", council: "CRBM" },
    { value: "educador_fisico", label: "Profissional de Educação Física", council: "CREF" },
];

/**
 * Retorna o conselho de classe baseado no tipo de profissional
 */
export const getCouncilByProfessionalType = (type) => {
    const professional = HEALTH_PROFESSIONAL_TYPES.find(p => p.value === type);
    return professional?.council || "Conselho";
};
