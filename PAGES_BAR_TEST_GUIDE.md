# 🧪 Guia de Testes Manuais - Pages Bar

## 📋 Preparação para Testes

### Ambiente de Teste
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, Tablet, Mobile
- **Resoluções**: 1920x1080, 1024x768, 768x1024, 375x667
- **Ferramentas**: DevTools, Lighthouse, Screen Reader

### Antes de Começar
1. ✅ Servidor de desenvolvimento rodando (`npm run dev`)
2. ✅ Console do navegador aberto
3. ✅ DevTools em modo responsivo
4. ✅ Extensions de acessibilidade (opcional)

---

## 🎯 Bateria de Testes Detalhados

### 📱 TESTE 1: Responsividade Multi-Dispositivo

#### Cenário 1.1: Desktop para Mobile
**Tempo estimado**: 5 minutos

**Setup**:
```
Resolução inicial: 1920x1080
Navegador: Chrome
```

**Passos detalhados**:
1. Abrir `http://localhost:3000` em 1920x1080
2. Verificar barra horizontal no topo
3. Redimensionar gradualmente: 1200px → 1024px → 768px → 375px
4. Observar breakpoint em 768px
5. Verificar aparição do botão hambúrguer

**Checkpoints**:
- [ ] Barra permanece fixa no topo até 768px
- [ ] Botão hambúrguer aparece em <768px
- [ ] Layout não quebra durante redimensionamento
- [ ] Textos permanecem legíveis
- [ ] Ícones mantêm proporções

**Resultado esperado**:
```
Desktop (≥768px): ═══[🏠 Início][📚 Biblioteca]═══
Mobile  (<768px): ☰ (menu oculto lateralmente)
```

#### Cenário 1.2: Teste em Tablet
**Orientação**: Portrait e Landscape

**Passos**:
1. Simular iPad (768x1024)
2. Verificar layout em portrait
3. Rotacionar para landscape (1024x768)
4. Verificar adaptação

**Checkpoints**:
- [ ] Portrait: Menu mobile ativo
- [ ] Landscape: Barra horizontal ativa
- [ ] Transição suave entre orientações

---

### 🍔 TESTE 2: Menu Mobile - Interações Avançadas

#### Cenário 2.1: Abertura com Animação
**Tempo estimado**: 3 minutos

**Passos**:
1. Modo mobile (375px)
2. Cronometrar clique no hambúrguer
3. Observar sequência de animação
4. Verificar elementos visuais

**Cronometragem esperada**:
- `0ms`: Clique no botão
- `0-100ms`: Botão vira X
- `0-300ms`: Menu desliza da esquerda
- `0-300ms`: Overlay fade-in
- `300ms`: Animação completa

**Checkpoints**:
- [ ] Duração total ≤ 300ms
- [ ] Não há "jumps" ou glitches
- [ ] Z-index correto (menu sobre conteúdo)
- [ ] Overlay cobre toda tela

#### Cenário 2.2: Fechamento - Múltiplas Formas
**Passos**:
1. Abrir menu mobile
2. **Método 1**: Clicar no X (botão transformado)
3. Reabrir menu
4. **Método 2**: Clicar no overlay
5. Reabrir menu
6. **Método 3**: Pressionar ESC
7. Reabrir menu
8. **Método 4**: Clicar em um item do menu

**Checkpoints para cada método**:
- [ ] Menu fecha com animação
- [ ] Overlay desaparece
- [ ] Botão volta ao estado hambúrguer
- [ ] Foco retorna ao elemento correto

---

### ⌨️ TESTE 3: Atalhos de Teclado - Teste Completo

#### Cenário 3.1: Atalhos Numéricos
**Passos**:
1. Garantir que há pelo menos 3 páginas configuradas
2. Pressionar `Ctrl + 1`
3. Aguardar navegação completa
4. Pressionar `Ctrl + 2`
5. Aguardar navegação completa
6. Pressionar `Ctrl + 3`

**Para cada atalho, verificar**:
- [ ] Feedback visual aparece (canto superior direito)
- [ ] Navegação ocorre
- [ ] Loading state é mostrado
- [ ] Página ativa é atualizada

**Texto do feedback esperado**:
```
"Navegação rápida: Nome da Página"
```

#### Cenário 3.2: Atalho Alt + H (Home)
**Passos**:
1. Navegar para qualquer página que não seja home
2. Pressionar `Alt + H`
3. Verificar retorno ao home

**Checkpoints**:
- [ ] Sempre retorna à primeira página
- [ ] Funciona de qualquer página
- [ ] Feedback correto exibido

#### Cenário 3.3: Navegação por Setas (Foco)
**Passos**:
1. Clicar em qualquer item da barra (dar foco)
2. Pressionar `→` (seta direita)
3. Pressionar `↓` (seta baixo)
4. Pressionar `←` (seta esquerda)
5. Pressionar `↑` (seta cima)
6. Pressionar `Home`
7. Pressionar `End`

**Checkpoints**:
- [ ] Foco move entre itens corretamente
- [ ] Funciona em ambas direções (↑↓ e ←→)
- [ ] `Home` vai para primeiro item
- [ ] `End` vai para último item
- [ ] Foco é visualmente claro

---

### 🔄 TESTE 4: Estados de Loading e Feedback

#### Cenário 4.1: Loading States Visuais
**Passos**:
1. Abrir DevTools → Network tab
2. Simular "Slow 3G" connection
3. Clicar em qualquer página
4. Observar indicadores de loading

**Elementos a verificar**:
- [ ] Spinner no item clicado
- [ ] Overlay geral da interface
- [ ] Mensagem de loading contextual
- [ ] Interface bloqueia interações

**Timeline esperada**:
```
0ms     → Click detectado
0-50ms  → Loading state ativo
50ms+   → Spinner visível
Xms     → Loading complete
X+100ms → Cleanup completo
```

#### Cenário 4.2: Feedback de Sucesso
**Passos**:
1. Navegar para qualquer página
2. Aguardar conclusão
3. Observar feedback visual

**Checkpoints**:
- [ ] Item pulsa levemente (scale 1.05)
- [ ] Cor de fundo muda temporariamente
- [ ] Transição suave de volta ao normal
- [ ] Duração ~600ms

---

### ❌ TESTE 5: Simulação de Erros

#### Cenário 5.1: Erro de Navegação
**Setup simulação**:
```javascript
// No console do navegador:
window.pagesBar.simulateError = true;
```

**Passos**:
1. Executar comando acima no console
2. Tentar navegar para qualquer página
3. Observar tratamento de erro

**Elementos de erro esperados**:
- [ ] Notificação no canto superior direito
- [ ] Cor vermelha (#dc3545)
- [ ] Ícone de erro (⚠️)
- [ ] Mensagem clara
- [ ] Botão de fechar (×)
- [ ] Auto-dismissal em 5s

**Estrutura da notificação**:
```
┌─────────────────────────────────┐
│ ⚠️ Erro ao carregar [Página]    │
│                              ×  │
└─────────────────────────────────┘
```

#### Cenário 5.2: Animação Shake
**Passos**:
1. Simular erro (método acima)
2. Clicar no item que falhará
3. Observar animação do item

**Checkpoints**:
- [ ] Item "balança" horizontalmente
- [ ] Duração ~500ms
- [ ] Fundo fica levemente vermelho
- [ ] Retorna ao estado normal

---

### ♿ TESTE 6: Acessibilidade Completa

#### Cenário 6.1: Navegação Apenas por Teclado
**Ferramentas**: Apenas teclado, sem mouse

**Passos**:
1. Recarregar página
2. Pressionar `Tab` repetidamente
3. Navegar por todos os elementos
4. Usar `Enter` para ativar itens
5. Usar `Space` quando aplicável

**Sequência de foco esperada**:
```
1. Primeiro item da barra
2. Segundo item da barra
3. [... outros itens ...]
4. Último item da barra
5. [Outros elementos da página]
```

**Checkpoints**:
- [ ] Todos os itens são alcançáveis
- [ ] Foco é claramente visível
- [ ] `Enter` ativa navegação
- [ ] Ordem lógica de tabulação

#### Cenário 6.2: Screen Reader (se disponível)
**Ferramentas**: NVDA, JAWS, ou VoiceOver

**Passos**:
1. Ativar screen reader
2. Navegar pela barra
3. Escutar anúncios
4. Testar navegação

**Anúncios esperados**:
- "Navigation landmark"
- "Button, [Nome da página]"
- "Current page" (para página ativa)
- Estado expandido/recolhido (mobile)

---

### 🎨 TESTE 7: Temas e Personalizações

#### Cenário 7.1: Dark/Light Mode do Sistema
**Passos**:
1. Verificar tema atual do SO
2. Alterar tema do sistema operacional
3. Recarregar página
4. Verificar adaptação

**Variáveis CSS a verificar**:
```css
/* Light mode */
--pages-bar-bg: #4B2D2B;
--pages-bar-text: #FFFFFF;

/* Dark mode (deve adaptar) */
--pages-bar-shadow: rgba(0, 0, 0, 0.5);
```

#### Cenário 7.2: Alto Contraste
**Passos**:
1. Ativar modo alto contraste do SO
2. Recarregar página
3. Verificar elementos

**Checkpoints**:
- [ ] Bordas mais espessas (3px vs 2px)
- [ ] Outline mais proeminente
- [ ] Cores mantêm contraste adequado

---

### 📱 TESTE 8: Performance e Fluidez

#### Cenário 8.1: Análise de Performance
**Ferramentas**: Chrome DevTools → Performance tab

**Passos**:
1. Abrir Performance tab
2. Clicar "Record"
3. Executar várias ações:
   - Abrir/fechar menu mobile 5x
   - Navegar entre páginas 5x
   - Usar atalhos de teclado 5x
4. Parar gravação
5. Analisar resultados

**Métricas objetivo**:
- [ ] FPS constante ≥ 55fps
- [ ] Sem long tasks >50ms
- [ ] Memory usage estável
- [ ] Layout shifts mínimos

#### Cenário 8.2: Teste de Stress
**Passos**:
1. Abrir/fechar menu mobile rapidamente 20x
2. Alternar entre páginas rapidamente 20x
3. Combinar múltiplos atalhos simultaneamente
4. Verificar que interface permanece responsiva

**Checkpoints**:
- [ ] Sem travamentos
- [ ] Animações permanecem fluidas
- [ ] Sem acúmulo de elementos DOM
- [ ] Memory usage controlado

---

### 🔍 TESTE 9: Debug e Logs

#### Cenário 9.1: Debug Mode
**Passos**:
1. Pressionar `Ctrl + Alt + P`
2. Verificar console
3. Repetir várias ações
4. Observar logs

**Logs esperados**:
```
🔍 Debug Pages Bar
  Estado atual: {object}
  Configuração: {object}
  Elementos DOM: {object}
  Páginas ativas: [array]
  Histórico: [array]
```

**Checkpoints**:
- [ ] Debug info completo
- [ ] Dados estruturados
- [ ] Informações atualizadas
- [ ] Feedback visual confirmação

---

### 📊 TESTE 10: Integração e Build

#### Cenário 10.1: Sistema de Build
**Passos**:
1. Modificar `pages-bar-metadados.json`
2. Executar `npm run consolidate-metadata`
3. Verificar arquivo gerado
4. Recarregar página
5. Verificar mudanças aplicadas

**Arquivo gerado esperado**:
```javascript
// metadata-consolidated.js
window.pagesBarMetadata = {
  pages: [...],
  styling: {...},
  generated: "timestamp"
};
```

---

## 📋 Checklist Final de Validação

### ✅ Funcionalidade Core
- [ ] Responsividade funciona em todos breakpoints
- [ ] Menu mobile abre/fecha em todos métodos
- [ ] Todos atalhos de teclado funcionam
- [ ] Navegação entre páginas funciona
- [ ] Estados de loading aparecem e somem
- [ ] Erros são capturados e exibidos

### ✅ Visual e UX
- [ ] Animações são fluidas (60fps)
- [ ] Feedbacks visuais são claros
- [ ] Layout não quebra em nenhuma resolução
- [ ] Cores e contrastes adequados
- [ ] Tipografia legível

### ✅ Performance
- [ ] Carregamento inicial rápido
- [ ] Sem memory leaks
- [ ] Animations performantes
- [ ] Interações responsivas

### ✅ Acessibilidade
- [ ] Navegação completa por teclado
- [ ] Screen readers funcionam
- [ ] Foco sempre visível
- [ ] Contraste WCAG AA

### ✅ Compatibilidade
- [ ] Chrome ✓
- [ ] Firefox ✓
- [ ] Safari ✓
- [ ] Edge ✓

---

## 🐛 Formulário de Report de Bug

**Quando encontrar um problema:**

```
Bug ID: #PB-[DATA]-[NUMERO]
Prioridade: [Alta/Média/Baixa]
Navegador: [Chrome/Firefox/Safari/Edge]
Resolução: [1920x1080/etc]
Dispositivo: [Desktop/Mobile/Tablet]

Descrição:
[Descrever o problema]

Passos para reproduzir:
1. [Passo 1]
2. [Passo 2]
3. [Resultado incorreto]

Comportamento esperado:
[O que deveria acontecer]

Evidências:
- Screenshot: [anexar]
- Video: [anexar se necessário]
- Console logs: [anexar se relevante]

Notas adicionais:
[Contexto relevante]
```

---

**📅 Tempo estimado total de testes**: 2-3 horas  
**👥 Testadores recomendados**: 2-3 pessoas  
**🔄 Frequência**: A cada alteração significativa  
**📈 Cobertura objetivo**: 95% dos cenários
