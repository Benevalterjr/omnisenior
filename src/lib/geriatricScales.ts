import { 
  BradenScale, 
  MorseScale, 
  KatzScale 
} from '@/types/ilpi';

// ==========================================
// 1. ESCALA DE BRADEN (Risco de Lesão por Pressão - LPP)
// ==========================================

export const BRADEN_OPTIONS = {
  sensoryPerception: [
    { value: 1, label: '1 - Totalmente limitado', desc: 'Completamente não responsivo a estímulos dolorosos.' },
    { value: 2, label: '2 - Muito limitado', desc: 'Responde apenas a estímulos dolorosos, não geme.' },
    { value: 3, label: '3 - Levemente limitado', desc: 'Responde a comandos verbais, mas não expressa desconforto sempre.' },
    { value: 4, label: '4 - Nenhuma limitação', desc: 'Responde a comandos verbais, sem déficit sensorial.' }
  ],
  moisture: [
    { value: 1, label: '1 - Constantemente úmida', desc: 'Pele quase sempre molhada por suor ou urina/fezes.' },
    { value: 2, label: '2 - Muito úmida', desc: 'Roupa de cama trocada pelo menos 1 vez por turno.' },
    { value: 3, label: '3 - Ocasionalmente úmida', desc: 'Necessita troca extra de roupa de cama 1 vez ao dia.' },
    { value: 4, label: '4 - Raramente úmida', desc: 'Pele geralmente seca, trocas de rotina habituais.' }
  ],
  activity: [
    { value: 1, label: '1 - Confinado ao leito', desc: 'Acamado em tempo integral.' },
    { value: 2, label: '2 - Confinado à cadeira', desc: 'Não consegue deambular, permanece sentado na poltrona.' },
    { value: 3, label: '3 - Deambula ocasionalmente', desc: 'Caminha pequenas distâncias durante o dia com ou sem ajuda.' },
    { value: 4, label: '4 - Deambula frequentemente', desc: 'Caminha fora do quarto pelo menos 2 vezes ao dia.' }
  ],
  mobility: [
    { value: 1, label: '1 - Totalmente imóvel', desc: 'Não faz nem pequenas mudanças de posição sem ajuda total.' },
    { value: 2, label: '2 - Muito limitado', desc: 'Faz pequenas mudanças ocasionais, incapaz de mudar frequentemente.' },
    { value: 3, label: '3 - Levemente limitado', desc: 'Faz mudanças frequentes, embora pequenas, sozinho.' },
    { value: 4, label: '4 - Nenhuma limitação', desc: 'Muda de posição frequentemente e sem qualquer auxílio.' }
  ],
  nutrition: [
    { value: 1, label: '1 - Muito pobre', desc: 'Nunca come uma refeição completa, raramente consome > 1/3 da comida.' },
    { value: 2, label: '2 - Provavelmente inadequada', desc: 'Come cerca de 1/2 das refeições, ingere dieta líquida ou suplemento.' },
    { value: 3, label: '3 - Adequada', desc: 'Come mais da metade da maioria das refeições, recusa ocasional.' },
    { value: 4, label: '4 - Excelente', desc: 'Come quase toda a refeição, nunca recusa, lanches entre refeições.' }
  ],
  frictionShear: [
    { value: 1, label: '1 - Problema evidente', desc: 'Requer assistência moderada a máxima para se mover, escorrega no leito.' },
    { value: 2, label: '2 - Problema potencial', desc: 'Move-se fracamente, necessita assistência mínima, desliza um pouco.' },
    { value: 3, label: '3 - Nenhum problema aparente', desc: 'Move-se no leito e cadeira de forma independente, sem deslizar.' }
  ]
};

export function calculateBraden(scores: {
  sensoryPerception: 1 | 2 | 3 | 4;
  moisture: 1 | 2 | 3 | 4;
  activity: 1 | 2 | 3 | 4;
  mobility: 1 | 2 | 3 | 4;
  nutrition: 1 | 2 | 3 | 4;
  frictionShear: 1 | 2 | 3;
}): BradenScale {
  const totalScore = 
    scores.sensoryPerception + 
    scores.moisture + 
    scores.activity + 
    scores.mobility + 
    scores.nutrition + 
    scores.frictionShear;

  let riskLevel: BradenScale['riskLevel'] = 'sem_risco';
  const actions: string[] = [];

  if (totalScore <= 9) {
    riskLevel = 'muito_alto';
    actions.push('Mudança de decúbito rigorosa a cada 2 horas (revezamento DD, DLD, DLE a 30°).');
    actions.push('Indicação imediata de Colchão Pneumático de pressão alternada.');
    actions.push('Proteção preventiva em sacro e calcâneos com cobertura hidrocoloide/espuma de poliuretano.');
    actions.push('Aplicação de Ácidos Graxos Essenciais (AGE) na pele íntegra e barreira protetora para umidade.');
    actions.push('Encaminhar para avaliação nutricional urgente (aporte proteico/suplementação).');
  } else if (totalScore <= 12) {
    riskLevel = 'alto';
    actions.push('Mudança de decúbito a cada 2 horas com coxim protetor.');
    actions.push('Uso de colchão piramidal (casca de ovo) de alta densidade ou pneumático.');
    actions.push('Hidratação corporal com AGE após o banho (sem massagear proeminências ósseas).');
    actions.push('Troca rápida de fraldas úmidas e aplicação de creme protetor de óxido de zinco.');
  } else if (totalScore <= 14) {
    riskLevel = 'moderado';
    actions.push('Mudança de decúbito a cada 2 a 3 horas.');
    actions.push('Elevação de calcâneos da superfície do colchão com travesseiro de apoio.');
    actions.push('Manter a cabeceira da cama elevada a no máximo 30° para evitar cisalhamento.');
    actions.push('Incentivar ingesta hídrica e alimentar diária.');
  } else if (totalScore <= 18) {
    riskLevel = 'baixo';
    actions.push('Incentivar deambulação diária e movimentação ativa.');
    actions.push('Inspeção diária da pele durante o banho de rotina.');
    actions.push('Hidratação cutânea rotineira.');
  } else {
    riskLevel = 'sem_risco';
    actions.push('Manter cuidados rotineiros de higiene e deambulação.');
    actions.push('Reavaliar mensalmente ou na ocorrência de qualquer alteração de saúde.');
  }

  return {
    ...scores,
    totalScore,
    riskLevel,
    recommendedActions: actions
  };
}

// ==========================================
// 2. ESCALA DE MORSE (Risco de Quedas)
// ==========================================

export const MORSE_OPTIONS = {
  fallHistory: [
    { value: 0, label: 'Não (0 pontos)', desc: 'Sem quedas registradas nos últimos 3 meses.' },
    { value: 25, label: 'Sim (25 pontos)', desc: 'Teve pelo menos 1 queda nos últimos 3 meses ou durante a internação.' }
  ],
  secondaryDiagnosis: [
    { value: 0, label: 'Não (0 pontos)', desc: 'Possui apenas 1 diagnóstico clínico ativo.' },
    { value: 15, label: 'Sim (15 pontos)', desc: 'Possui 2 ou mais diagnósticos no prontuário médico.' }
  ],
  ambulatoryAid: [
    { value: 0, label: 'Nenhum / Acamado / Auxiliado (0 pontos)', desc: 'Não usa apoio ou anda com ajuda de cuidador/acamado.' },
    { value: 15, label: 'Bengala / Muleta / Andador (15 pontos)', desc: 'Utiliza dispositivo auxiliar de marcha.' },
    { value: 30, label: 'Apoia-se em móveis/paredes (30 pontos)', desc: 'Segura nos móveis para manter o equilíbrio ao andar.' }
  ],
  ivTherapy: [
    { value: 0, label: 'Não (0 pontos)', desc: 'Sem acesso venoso ou infusão contínua.' },
    { value: 20, label: 'Sim (20 pontos)', desc: 'Acesso venoso periférico, cateter salinizado ou heparina/soro.' }
  ],
  gait: [
    { value: 0, label: 'Normal / Acamado / Cadeira de rodas (0 pontos)', desc: 'Passos ritmados, cabeça erguida ou não deambula.' },
    { value: 10, label: 'Fraca / Passos curtos (10 pontos)', desc: 'Curvado, passos curtos, arrasta pés mas não perde equilíbrio.' },
    { value: 20, label: 'Comprometida / Cambaleante (20 pontos)', desc: 'Dificuldade para levantar, passos hesitantes, perde o equilíbrio.' }
  ],
  mentalStatus: [
    { value: 0, label: 'Orientado (0 pontos)', desc: 'Consciente de suas próprias capacidades e limitações físicas.' },
    { value: 15, label: 'Superestima capacidade / Esquece limitações (15 pontos)', desc: 'Tenta levantar sozinho desrespeitando orientações da equipe.' }
  ]
};

export function calculateMorse(scores: {
  fallHistory: 0 | 25;
  secondaryDiagnosis: 0 | 15;
  ambulatoryAid: 0 | 15 | 30;
  ivTherapy: 0 | 20;
  gait: 0 | 10 | 20;
  mentalStatus: 0 | 15;
}): MorseScale {
  const totalScore = 
    scores.fallHistory + 
    scores.secondaryDiagnosis + 
    scores.ambulatoryAid + 
    scores.ivTherapy + 
    scores.gait + 
    scores.mentalStatus;

  let riskLevel: MorseScale['riskLevel'] = 'baixo';
  const actions: string[] = [];

  if (totalScore >= 51) {
    riskLevel = 'alto';
    actions.push('Identificação visual no leito com placa de ALTO RISCO DE QUEDA e pulseira amarela.');
    actions.push('Manter grades bilaterais elevadas no leito e cama travada na menor altura.');
    actions.push('Acompanhamento presencial obrigatório para todas as locomoções e idas ao vaso sanitário.');
    actions.push('Uso estrito de calçados fechados antiderrapantes; nunca permitir meias lisas.');
    actions.push('Manter campainha de emergência e objetos pessoais ao alcance imediato das mãos.');
  } else if (totalScore >= 25) {
    riskLevel = 'moderado';
    actions.push('Sinalização de Risco Médio de Queda no leito.');
    actions.push('Manter ambiente desobstruído e bem iluminado (luz de vigília noturna).');
    actions.push('Supervisão nas transferências (leito para cadeira e vaso sanitário).');
    actions.push('Orientar o residente a aguardar sentado 1 minuto antes de ficar de pé para evitar hipotensão ortostática.');
  } else {
    riskLevel = 'baixo';
    actions.push('Orientação básica sobre segurança no quarto.');
    actions.push('Piso seco e livre de tapetes ou fios.');
    actions.push('Reavaliação mensal ou após início de medicação psicotrópica/sedativa.');
  }

  return {
    ...scores,
    totalScore,
    riskLevel,
    recommendedActions: actions
  };
}

// ==========================================
// 3. ÍNDICE DE KATZ (Atividades Básicas da Vida Diária - ABVD)
// Classificação Oficial de Grau de Dependência da ANVISA (RDC 502/2021)
// ==========================================

export const KATZ_OPTIONS = [
  {
    key: 'bathing',
    title: 'Banho',
    desc: 'Lavar todo o corpo, entrar e sair do chuveiro ou banheira.'
  },
  {
    key: 'dressing',
    title: 'Vestir-se',
    desc: 'Pegar as roupas do armário, vestir peças íntimas, meias e sapatos.'
  },
  {
    key: 'toileting',
    title: 'Uso do Vaso Sanitário',
    desc: 'Ir ao banheiro, despir-se, fazer a higiene íntima e recompor-se.'
  },
  {
    key: 'transferring',
    title: 'Transferência',
    desc: 'Passar da cama para a cadeira/poltrona e retornar sozinho.'
  },
  {
    key: 'continence',
    title: 'Continência Esfincteriana',
    desc: 'Controle completo da micção (urina) e evacuação (fezes).'
  },
  {
    key: 'feeding',
    title: 'Alimentação',
    desc: 'Levar o alimento do prato à boca mastigando e deglutindo sem ajuda.'
  }
];

export function calculateKatz(scores: {
  bathing: 0 | 1;
  dressing: 0 | 1;
  toileting: 0 | 1;
  transferring: 0 | 1;
  continence: 0 | 1;
  feeding: 0 | 1;
}): KatzScale {
  const totalScore = 
    scores.bathing + 
    scores.dressing + 
    scores.toileting + 
    scores.transferring + 
    scores.continence + 
    scores.feeding;

  let dependencyDegree: KatzScale['dependencyDegree'] = 'grau_1';
  let dependencyDescription = '';
  let recommendedCaregiverRatio = '';

  if (totalScore === 6) {
    dependencyDegree = 'grau_1';
    dependencyDescription = 'Grau I (Independente) — Idoso independente em todas as 6 funções da vida diária.';
    recommendedCaregiverRatio = '1 cuidador para cada 20 residentes (ou fração) por turno de 8h (ANVISA RDC 502/2021)';
  } else if (totalScore >= 4) {
    dependencyDegree = 'grau_2';
    dependencyDescription = 'Grau II (Dependência Parcial) — Necessita de auxílio em até 3 atividades básicas.';
    recommendedCaregiverRatio = '1 cuidador para cada 10 residentes (ou fração) por turno de 8h (ANVISA RDC 502/2021)';
  } else {
    dependencyDegree = 'grau_3';
    dependencyDescription = 'Grau III (Dependência Total / Maior) — Requer assistência em 4 ou mais atividades básicas.';
    recommendedCaregiverRatio = '1 cuidador para cada 6 residentes (ou fração) por turno de 8h (ANVISA RDC 502/2021)';
  }

  return {
    ...scores,
    totalScore,
    dependencyDegree,
    dependencyDescription,
    recommendedCaregiverRatio
  };
}
