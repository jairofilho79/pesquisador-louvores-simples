# Prompt para Nova Conversa - Pesquisador de Louvores

## 🎯 INSTRUÇÃO PRINCIPAL PARA COPILOT

```
Estou trabalhando no projeto "Pesquisador de Louvores" - um sistema de busca e filtros para partituras musicais em JavaScript vanilla.

LEIA PRIMEIRO: Existe um arquivo CONTEXT_PRESERVATION.md na raiz do projeto com TODA a documentação técnica detalhada. SEMPRE consulte este arquivo antes de fazer qualquer sugestão ou modificação.

ESTADO ATUAL:
✅ Sistema de filtros completamente implementado e funcional
✅ Organização visual por seções master (PDFs/Áudios) 
✅ Interface responsiva desktop/mobile
✅ Persistência em localStorage
✅ 2106+ louvores catalogados em assets2-louvores.js

ARQUIVOS PRINCIPAIS:
- src/js/filterComponent.js (lógica de filtros)
- src/js/searchOptionComponent.js (exibição organizacional)  
- src/css/searchOption.css (styling)
- CONTEXT_PRESERVATION.md (documentação completa)

IMPORTANTE: 
- O sistema está COMPLETO e FUNCIONAL
- NÃO há bugs conhecidos no momento
- Futuras melhorias envolvem sistema de metadata JSON (não implementar sem solicitação)

Antes de qualquer sugestão, analise o CONTEXT_PRESERVATION.md para entender completamente o estado atual do projeto.
```

## 📋 CONTEXTOS ESSENCIAIS PARA PRESERVAR

### 1. **Estrutura de Dados** 
- assets2-louvores.js com 2106+ louvores
- Estrutura: {pdfs: [], audios: [], subfolders: []}
- Cada subfolder tem próprios pdfs/audios arrays

### 2. **Lógica de Filtros**
- FilterComponent.filterFiles() trata PDFs E áudios
- Classificação automática: classifyContent()
- Estado "Todos" bypassa filtros específicos
- "Só PDF" remove áudios do resultado

### 3. **Organização Visual**
- createMasterSection() separa PDFs e Áudios
- createCollapsibleSubfolder() para expansão
- Contadores automáticos de arquivos
- CSS responsivo para desktop/mobile

### 4. **Persistência**
- localStorage chave: 'pesquisador-filters'
- Sincronização automática UI ↔ storage
- Estados desktop/mobile sincronizados

### 5. **Bugs Já Resolvidos**
- ❌ Áudios não apareciam quando "Só PDF" desmarcado
- ❌ Organização confusa com conteúdo misturado
- ❌ Dessincronização desktop/mobile
- ❌ Dropdown mobile saindo da tela

## 🚨 AVISOS IMPORTANTES

1. **NÃO sugerir reimplementação** - sistema está completo
2. **NÃO alterar estrutura de dados** - compatível com 2106+ louvores
3. **SEMPRE ler CONTEXT_PRESERVATION.md** antes de mudanças
4. **NÃO implementar metadata JSON** - é roadmap futuro
5. **Testar em console** com window.filterComponent.debugFilters()

## 📁 Arquivos que DEVEM ser consultados em nova conversa:

1. `CONTEXT_PRESERVATION.md` - **OBRIGATÓRIO LER PRIMEIRO**
2. `src/js/filterComponent.js` - Lógica principal
3. `src/js/searchOptionComponent.js` - Display
4. `assets2-louvores.js` - Estrutura de dados
5. `src/css/searchOption.css` - Styling atual

---
**Este prompt garante continuidade total do projeto sem perda de contexto técnico.**
