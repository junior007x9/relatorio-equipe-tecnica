// lib/equipe.ts
export const AREAS_TECNICAS_DEFAULT = {
  pedagogica: {
    nome: "Área Pedagógica",
    profissionais: [
      { cargo: "Pedagogo", nome: "Vanderlan", turno: "Manhã" },
      { cargo: "Socioeducador", nome: "Junior", turno: "Tarde" }
    ]
  },
  psicologica: {
    nome: "Área Psicológica",
    profissionais: [
      { cargo: "Psicóloga", nome: "Caroline", turno: "Manhã" } // Corrigido para Manhã
    ]
  },
  social: {
    nome: "Área Social",
    profissionais: [
      { cargo: "Assistente Social", nome: "Samia", turno: "Tarde" } // Corrigido para Tarde
    ]
  },
  saude: {
    nome: "Área da Saúde",
    profissionais: [
      { cargo: "Enfermeira", nome: "A definir", turno: "Manhã" },
      { cargo: "Téc. de Enfermagem", nome: "Luana", turno: "Tarde" }
    ]
  }
};