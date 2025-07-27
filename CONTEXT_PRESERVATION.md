# Contexto de Preservação do Projeto - Pesquisador de Louvores

## 📋 PROMPT PARA NOVA CONVERSA

```
Estou trabalhando no projeto "Pesquisador de Louvores" - um sistema de busca e filtros para partituras e áudios musicais em JavaScript vanilla. 

CONTEXTO TÉCNICO ATUAL:
- Sistema de filtros completamente implementado e funcional
- Organização por seções master (PDFs/Áudios) com subpastas expansíveis
- Persistência de filtros em localStorage
- Design responsivo (desktop/mobile)
- Arquitetura em componentes: FilterComponent + SearchOptionComponent

ESTADO DO CÓDIGO:
- FilterComponent: Lógica de filtros com classificação inteligente de conteúdo
- SearchOptionComponent: Exibição organizacional com createMasterSection()
- CSS: Styling completo para nova estrutura organizacional

DADOS:
- assets2-louvores.js: 2106+ louvores com estrutura {pdfs: [], audios: [], subfolders: []}
- Classificação automática: Coro, Grade, Sopros, Cordas baseada em nomes de arquivo

FUNCIONALIDADES IMPLEMENTADAS:
✅ Filtro "Só PDF" (remove áudios)
✅ Filtros de conteúdo (Todos/Coro/Grade/Sopros/Cordas)
✅ Persistência localStorage com chave 'pesquisador-filters'
✅ UI responsiva com checkboxes (desktop) e dropdown (mobile)
✅ Organização master sections separando PDFs e Áudios
✅ Subpastas expansíveis com contadores de arquivos
✅ Sincronização desktop/mobile para todos os controles

ARQUIVOS PRINCIPAIS:
- src/js/filterComponent.js - Lógica completa de filtros
- src/js/searchOptionComponent.js - Display organizacional
- src/css/searchOption.css - Styling da estrutura

PRÓXIMOS PASSOS PLANEJADOS (NÃO IMPLEMENTAR AGORA):
- Sistema de metadata JSON para classificação determinística
- Interface de edição de metadados
- Análise de 50 louvores mais populares para MVP

Preciso continuar trabalhando neste projeto. Use este contexto para entender completamente o estado atual antes de sugerir mudanças.
```

## 🏗️ ARQUITETURA DO SISTEMA

### Estrutura de Dados
```javascript
// assets2-louvores.js - Estrutura por louvor
{
    "nome": "Nome do Louvor",
    "pdfs": ["caminho/arquivo1.pdf", "caminho/arquivo2.pdf"],
    "audios": ["caminho/audio1.mp3", "caminho/audio2.wav"],
    "subfolders": [
        {
            "name": "Nome da Subpasta",
            "pdfs": ["subpasta/arquivo.pdf"],
            "audios": ["subpasta/audio.mp3"]
        }
    ]
}
```

### Componentes Principais

#### FilterComponent (src/js/filterComponent.js)
- **Responsabilidade**: Lógica de filtros e classificação de conteúdo
- **Funcionalidades**:
  - Filtro "Só PDF" (remove áudios quando ativo)
  - Filtros de conteúdo: Todos, Coro, Grade, Sopros, Cordas
  - Persistência em localStorage (chave: 'pesquisador-filters')
  - Sincronização desktop/mobile
  - Classificação inteligente por nome de arquivo

#### SearchOptionComponent (src/js/searchOptionComponent.js)
- **Responsabilidade**: Exibição organizacional dos resultados
- **Funcionalidades**:
  - createMasterSection() - Separa PDFs e Áudios em seções distintas
  - createCollapsibleSubfolder() - Subpastas expansíveis
  - Contadores de arquivos
  - Detecção automática de tipo de arquivo

### CSS (src/css/searchOption.css)
- Classes para master sections (.master-file-section)
- Styling para subpastas expansíveis (.collapsible-subfolder)
- Design responsivo para filtros
- Ícones e animações para expand/collapse

## 🔍 LÓGICA DE FILTROS

### Classificação de Conteúdo (classifyContent)
```javascript
// Ordem de prioridade na classificação:
1. Grade - "grade", "partitura completa", "(grade)", "full score"
2. Sopros - "sax", "flauta", "clarineta", "trombone", etc.
3. Coro - "coro", "vocal", "voz", "melodia", vozes específicas
4. Cordas - "violino", "viola", "cello", "contrabaixo", etc.
5. Outros - piano, cifra, bateria, etc.
```

### Comportamento dos Filtros
- **"Todos" ativo**: Mostra TODOS os PDFs, ignora filtros específicos
- **"Todos" inativo**: Aplica filtros específicos selecionados
- **"Só PDF" ativo**: Remove áudios, mantém apenas PDFs
- **Nenhum filtro específico**: Retorna array vazio

## 📁 ESTRUTURA DE PASTAS
```
src/
├── css/
│   └── searchOption.css (styling organizacional)
├── js/
│   ├── filterComponent.js (lógica de filtros)
│   └── searchOptionComponent.js (exibição)
assets2/
├── Louvores Avulsos (Diversos)/
├── Louvores Avulsos (Migrados)/
├── Louvores Avulsos (PES)/
├── Louvores Avulsos CIAs/
├── Louvores Coletânea (PES)/
├── Louvores Coletânea CIAs/
├── Louvores Coletânea de Partituras/
└── Repertório GLTM/
```

## 🎯 FUNCIONALIDADES IMPLEMENTADAS

### ✅ Sistema de Filtros Completo
1. **Filtro de Tipo**:
   - "Só PDF": Remove áudios, mantém apenas PDFs
   
2. **Filtros de Conteúdo**:
   - "Todos": Estado master, quando ativo ignora filtros específicos
   - "Coro": Vozes, melodia, vocal
   - "Grade": Partitura completa, grade geral
   - "Sopros": Instrumentos de sopro (sax, flauta, etc.)
   - "Cordas": Instrumentos de corda (violino, viola, etc.)

### ✅ Interface Responsiva
1. **Desktop**: Checkboxes horizontais
2. **Mobile**: Dropdown condensado com contador "X de Y selecionados"
3. **Sincronização**: Estados sincronizados entre desktop e mobile

### ✅ Persistência
- localStorage com chave 'pesquisador-filters'
- Estado restaurado automaticamente no carregamento
- Sincronização automática UI ↔ localStorage

### ✅ Organização Visual
1. **Master Sections**: Separação clara entre PDFs e Áudios
2. **Subpastas Expansíveis**: Toggle com ícones e contadores
3. **Contadores**: "(X arquivos)" em cada seção/subpasta

## 🚧 ROADMAP FUTURO (NÃO IMPLEMENTADO)

### Fase 1: MVP de Metadata (4-6 meses)
- Arquivo JSON com metadata determinística
- 50 louvores mais populares para prova de conceito
- Classificação manual precisa

### Fase 2: Interface de Edição (6-8 meses)
- CRUD para metadados
- Interface administrativa
- Validação e backup

### Fase 3: Sistema Completo (12-28 meses)
- Catalogação completa dos 2106+ louvores
- Sistema automatizado de classificação
- Analytics e relatórios

## 🐛 BUGS RESOLVIDOS

1. **Áudios não apareciam**: filterFiles() não tratava corretamente o estado "Todos"
2. **Organização confusa**: Implementada separação master PDF/Áudio
3. **Mobile UX**: Dropdown responsivo com posicionamento inteligente
4. **Sincronização**: Estados desktop/mobile dessincronizados

## 📊 MÉTRICAS DO SISTEMA

- **Total de Louvores**: 2106+
- **Estrutura de Dados**: Híbrida (PDFs + Áudios + Subpastas)
- **Categorias de Conteúdo**: 4 principais + "Outros"
- **Tipos de Arquivo**: PDF, MP3, WAV, MIDI
- **Compatibilidade**: Desktop + Mobile responsivo

## 🔧 COMANDOS DE DEBUG

```javascript
// No console do navegador:
window.filterComponent.debugFilters() // Ver estado e testar arquivos
window.filterComponent.clearStorage() // Limpar localStorage
window.filterComponent.resetFilters() // Reset completo
```

## 📝 NOTAS IMPORTANTES

1. **NÃO filtrar louvores**: Sistema mostra todos os resultados de busca, filtra apenas conteúdo interno
2. **Prioridade de classificação**: Grade > Sopros > Coro > Cordas > Outros
3. **Estado "Todos"**: Comportamento especial que bypassa filtros específicos
4. **Detecção de tipo**: Automática baseada em extensão de arquivo
5. **Pasta assets2**: Contém toda a estrutura de arquivos organizados

---

**IMPORTANTE**: Este documento deve ser referenciado em toda nova conversa sobre este projeto para manter continuidade total do desenvolvimento.
