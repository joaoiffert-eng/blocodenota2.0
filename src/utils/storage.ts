import { Note } from '../types/note';

const STORAGE_KEY = 'bloco_de_notas_v1_notes';
const THEME_KEY = 'bloco_de_notas_theme';
const TEXT_SIZE_KEY = 'bloco_de_notas_text_size';

export const INITIAL_SAMPLE_NOTES: Note[] = [
  {
    id: 'sample-1',
    title: 'Resumo de Biologia: Estrutura e Função Celular',
    content: `Principais conceitos para a prova da próxima semana:

1. Membrana Plasmática:
   • Bicamada fosfolipídica com proteínas integradas.
   • Permeabilidade seletiva (transporte passivo vs. ativo).

2. Mitocôndrias:
   • Respiração celular e geração de ATP (energia).
   • Possuem DNA próprio herdado da linhagem materna.

3. Retículo Endoplasmático e Complexo de Golgi:
   • RER: síntese de proteínas por meio de ribossomos aderidos.
   • REL: síntese de lipídios e desintoxicação.
   • Golgi: empacotamento, modificação e secreção celular.

📌 Dica do professor: revisar o ciclo de Krebs e a fosforilação oxidativa!`,
    category: 'estudos',
    isFavorite: true,
    isPinned: true,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'sample-2',
    title: 'Planejamento do Projeto: Lançamento Q4',
    content: `Metas e entregáveis prioritários para a equipe:

[✓] Alinhamento inicial de escopo com os stakeholders
[✓] Validação dos requisitos de acessibilidade e usabilidade
[ ] Desenho da nova interface com paleta moderna (azul, verde e lilás)
[ ] Revisão de segurança e testes de desempenho
[ ] Apresentação para a diretoria na sexta-feira às 14h

Responsáveis:
- Design: Clara & Lucas
- Desenvolvimento: Equipe de Engenharia
- Gestão: Gabriel

Prazo final: 30 de Novembro.`,
    category: 'trabalho',
    isFavorite: true,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'sample-3',
    title: 'Livros para Ler & Hábitos Saudáveis',
    content: `Minha lista de desenvolvimento pessoal para este ano:

📚 Leituras recomendadas:
• "Hábitos Atômicos" – James Clear
• "O Homem que Calculava" – Malba Tahan
• "Essencialismo" – Greg McKeown

🌿 Hábitos para cultivar diariamente:
1. Tomar 2,5 litros de água.
2. Caminhada leve ou corrida matinal (30 minutos).
3. 15 minutos de leitura antes de dormir sem telas.
4. Praticar gratidão no fim do dia.

"Pequenas melhorias diárias ao longo do tempo produzem resultados impressionantes."`,
    category: 'pessoal',
    isFavorite: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'sample-4',
    title: 'Fórmulas de Matemática Financeira',
    content: `Anotações rápidas para a aula de Economia Aplicada:

• Juros Simples:
  J = C × i × t
  M = C + J = C × (1 + i × t)

• Juros Compostos:
  M = C × (1 + i)^t
  J = M - C

• Valor Presente Líquido (VPL):
  VPL = Σ [FC_t / (1 + taxa)^t] - Investimento Inicial

💡 Lembrar de verificar sempre se a taxa de juros (i) e o tempo (t) estão na mesma unidade de tempo (mês, ano).`,
    category: 'estudos',
    isFavorite: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'sample-5',
    title: 'Pauta da Reunião Semanal com a Coordenação',
    content: `Itens a serem abordados na reunião de segunda-feira:

1. Atualização dos cronogramas das turmas de graduação.
2. Suporte para estudantes com necessidades educacionais especiais.
3. Aquisição de novos materiais para os laboratórios.
4. Calendário de provas e bancas de avaliação.

Anotação importante: Enviar ata resumida por e-mail até o final da tarde.`,
    category: 'trabalho',
    isFavorite: false,
    isPinned: false,
    createdAt: new Date(Date.now() - 3600000 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
];

export function getStoredNotes(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_NOTES));
      return INITIAL_SAMPLE_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_SAMPLE_NOTES;
  } catch (error) {
    console.error('Erro ao ler notas do localStorage:', error);
    return INITIAL_SAMPLE_NOTES;
  }
}

export function saveStoredNotes(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('Erro ao salvar notas no localStorage:', error);
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch {
    return 'light';
  }
}

export function saveStoredTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // silent catch
  }
}

export function getStoredTextSize(): 'normal' | 'large' | 'xlarge' {
  try {
    const raw = localStorage.getItem(TEXT_SIZE_KEY);
    if (raw === 'normal' || raw === 'large' || raw === 'xlarge') return raw;
    return 'normal';
  } catch {
    return 'normal';
  }
}

export function saveStoredTextSize(size: 'normal' | 'large' | 'xlarge'): void {
  try {
    localStorage.setItem(TEXT_SIZE_KEY, size);
  } catch {
    // silent catch
  }
}

export function exportNotesToFile(notes: Note[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notes, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `bloco-de-notas-backup-${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSingleNoteAsTxt(note: Note): void {
  const content = `TÍTULO: ${note.title}\nCATEGORIA: ${note.category.toUpperCase()}\nÚLTIMA ATUALIZAÇÃO: ${new Date(note.updatedAt).toLocaleString('pt-BR')}\n\n----------------------------------------\n\n${note.content}`;
  const dataStr = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const sanitizedTitle = note.title.toLowerCase().replace(/[^a-z0-9]/gi, '_').substring(0, 30);
  downloadAnchor.setAttribute('download', `${sanitizedTitle || 'anotacao'}.txt`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
