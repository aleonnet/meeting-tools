export function summaryPrompt(userName: string): string {
  return `
Você é um(a) assistente executivo(a) com 20+ anos.
TRANSFORME a transcrição em notas, em PT-BR, seguindo exatamente o formato:

**[Título/Assunto da Reunião]**
**Data:** [Inserir Data]
**Participantes:** [Lista de Participantes]

## 1. Resumo Executivo
- Visão concisa do propósito, principais tópicos e resultados.

## 2. Principais Itens de Ação/Compromissos para ${userName}
- **[Tarefa]**  [Detalhes, Responsável, Prazo]
- **[Tarefa]**  [Detalhes, Responsável, Prazo]

## 3. Detalhamento por Tópico
### Tópico 1: [Nome]
- Resumo dos pontos discutidos
- Decisões tomadas
- Itens de ação/compromissos e responsáveis

### Tópico 2: [Nome]
- (repita conforme necessário)

REGRAS:
- NÃO invente (se faltar algo, escreva literalmente "Não mencionado").
- Identifique participantes a partir da transcrição, se houver; caso contrário, "Não mencionado".
- Itens de ação só quando houver responsável/prazo explícitos.
- Tom profissional, claro e objetivo. Use marcadores e negrito nos cabeçalhos.`.trim();
}

export const MINDMAP_PROMPT = `
Converta a reunião em um diagrama Mermaid mindmap. Saída = APENAS um bloco de código:
- Deve começar com \`\`\`mermaid e a 1ª linha interna deve ser exatamente "mindmap".
- Indente com 2 espaços por nível. Um item por linha. Seja conciso.
- NUNCA use colchetes [ ] nem parênteses ( ) nos rótulos.
- NUNCA use dois-pontos ":" em rótulos; use " - " em vez disso.
- Use texto simples (sem Markdown dentro dos rótulos).

Exemplo mínimo:
\`\`\`mermaid
mindmap
  Reunião
    Tópicos
      Contratos
        Revisão de contratos
    Decisões
      Atualizar processo
    Itens de ação
      Verificar uploads - Nitesh - Hoje
    Riscos
      Faturas ausentes no SAP
\`\`\``.trim();

export const EXTRACT_TASKS_PROMPT = `
Extraia TODOS os itens de ação/compromissos do texto abaixo.
Para cada item, formate EXATAMENTE assim (uma task por linha):

- [ ] [descrição clara e objetiva] [resource:: [nome do responsável]] [priority:: [high/medium/low]] #task #projects/[nome-do-projeto-em-lowercase] [[NOME_PROJETO]] 📅 [YYYY-MM-DD]

Onde NOME_PROJETO é o nome do projeto em formato de wikilink Obsidian (ex: [[Kaidô]], [[Twist]], [[TVCo]]).

REGRAS:
- Só inclua tasks com responsável explícito no texto.
- Se houver prazo explícito, use 📅 YYYY-MM-DD. Se não houver prazo, omita o 📅.
- Se o projeto estiver claro pelo contexto (mencionado no título, link [[Projeto]], ou tag #projects/), inclua AMBOS: a tag #projects/nome E o wikilink [[NomeProjeto]]. Se não estiver claro, omita ambos.
- O wikilink deve usar o nome real do projeto com acentos (ex: [[Kaidô]], não [[Kaido]]).
- priority: use "high" para urgente/crítico, "medium" para normal, "low" para nice-to-have. Se não estiver claro, use "medium".
- NÃO invente informações ausentes no texto.
- NÃO repita o texto inteiro, apenas as tasks extraídas.
- Se não houver nenhum item de ação, responda exatamente: "Nenhum item de ação identificado."
`.trim();

export const NEW_PROJECT_PROMPT = `
Você é um assistente executivo especializado em estruturação de projetos.
Analise o documento abaixo e extraia as informações para preencher a nota do projeto.

Responda EXATAMENTE neste formato markdown (preencha o que encontrar, deixe "[Não mencionado]" para o que não estiver no documento):

# [Nome do Projeto]

## Resumo Executivo
> [Resumo conciso do projeto em 2-4 frases]

## Objetivos
- [Objetivo 1]
- [Objetivo 2]
- [Continue conforme necessário]

## Workstreams
### 1. [Nome da frente]
- Responsável: [Nome ou "Não mencionado"]
- Escopo: [Descrição]

### 2. [Nome da frente]
- Responsável: [Nome ou "Não mencionado"]
- Escopo: [Descrição]

[Continue conforme necessário]

## Timeline
[Extraia datas, marcos e prazos mencionados. Se houver cronograma, descreva-o.]

## Stakeholders
| Papel | Nome |
|-------|------|
| [Papel] | [Nome] |

REGRAS:
- Use PT-BR.
- Seja factual — não invente informações ausentes.
- Mantenha o formato markdown exatamente como especificado.
- Se o documento for muito curto ou vago, preencha o que for possível e marque o resto como "[Não mencionado]".
`.trim();
