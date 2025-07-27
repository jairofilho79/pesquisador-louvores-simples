# Bem-vindo!
Aplicação simples para busca de partituras de coro da coletânea e avulsos da ICM

## Uso cotidiano:
- Acesse: https://jairofilho79.github.io/pesquisador-louvores-simples
- Pesquise o louvor desejado
- Aperte em "Pesquisar" (ou aperte enter)
- O PDF será aberto em outra aba
- Pode abrir quantas abas forem necessárias

## Sobre o conteúdo
Somente louvores cantados nas igrejas ICM estão sendo disponibilizados aqui.

**Fontes:**
- Coletânea de Partituras Adultos
- Coletânea de Partituras CIAs  
- Avulsos do Departamento de Louvor [última atualização em Abril/2025]
- Repertório do Grupo de Louvor do Maanaim de Uberlândia (Em breve)
- Drive do Sarzedo (em breve)

**Total atual: 1.146 louvores mapeados automaticamente**

## Em breve!
Uma versão mais completa e multifuncional dessa aplicação.

---

# 🛠️ DESENVOLVIMENTO

## Comandos rápidos (recomendados)

```bash
# Instalar dependências (primeira vez)
npm install

# Servidor de desenvolvimento (abre automaticamente)
npm run dev

# Mapear assets2 (após mudanças na pasta)
npm run map-assets

# Build completo para deploy
npm run build

# Página de testes
npm run test
```

## Comandos manuais (alternativos)

```bash
# Servidor HTTP manual
http-server . -c-1 --fallback index.html

# Ou usando npx (sem instalação)
npx http-server . -c-1 --fallback index.html
```

**Acesse:** http://localhost:8080

## Atualizando dados dos louvores

### Desenvolvimento rápido:
```bash
cd scripts
node assetsFolderMapper.js
```

### Build completo para deploy:
```bash
cd scripts
node build-deploy.js
```

## Testando o sistema
```bash
# Abrir página de testes
# http://localhost:8080/test-asset-mapper.html
```

## Scripts disponíveis

| Script | Função |
|--------|--------|
| `assetsFolderMapper.js` | Mapeia pasta assets2 e gera dados |
| `build-deploy.js` | Build completo com versionamento |
| `louvoresMapper.js` | ⚠️ OBSOLETO - usava louvores.js antigo |

## Estrutura dos dados

O sistema agora mapeia automaticamente a pasta `assets2/` e gera:

- **`assets2-louvores.js`** - Dados versionados para o frontend
- **`assets2-mapping.json`** - Dados completos em JSON  
- **`assets2-version.json`** - Controle de versão

**Formato dos louvores:**
```javascript
{
  nome: "Nome do louvor",
  numero: 123, // ou null
  status: "V", // [V]Completo, [A]Incompleto, [P]Ausente
  caminhoCompleto: "assets2/pasta/subpasta",
  pdfs: ["caminho/arquivo1.pdf", "caminho/arquivo2.pdf"],
  audios: ["caminho/audio1.mp3", "caminho/audio2.mp3"]
}
```

## ⚠️ IMPORTANTE: Padrões de Nomenclatura de Louvores

Para que os louvores apareçam corretamente na pesquisa, as pastas de nível 2 (louvores) devem seguir padrões específicos:

### Padrões VÁLIDOS ✅
```
assets2/
├── [Categoria]/
│   ├── 001 - [P] Nome do Louvor/          ✅ Coletânea com número e status
│   ├── [P] Nome do Louvor/                ✅ Avulso com status
│   ├── 002 - Nome do Louvor [V]/          ✅ Coletânea com status no final
│   └── 609 - [V] Nome Completo/           ✅ Números maiores com status
```

### Padrões INVÁLIDOS ❌
```
assets2/
├── [Categoria]/
│   ├── Nome do Louvor/                    ❌ Sem indicador de status
│   ├── Pasta qualquer/                    ❌ Nome genérico
│   └── 001 Nome sem hífen/                ❌ Formato incorreto
```

### Status Válidos:
- **[V]** - Completo (áudio + partitura)
- **[A]** - Incompleto (só áudio ou só partitura)  
- **[P]** - Apenas PDF

### Estrutura de Níveis:
```
assets2/                                   ← Nível 0 (raiz)
├── Louvores Avulsos (PES)/               ← Nível 1 (categoria)
│   ├── 002 - Nome do Louvor [V]/         ← Nível 2 (LOUVOR) ✅ 
│   │   ├── coro.pdf                      ← Nível 3+ (arquivos/subpastas)
│   │   └── Sopro/                        ← Nível 3+ (subpastas)
│   │       └── instrumentos...
```

**⚠️ ATENÇÃO:** Apenas pastas de **nível 2** com padrões válidos aparecerão nos cards de pesquisa. Subpastas (nível 3+) aparecem apenas quando o card é expandido.

### Como Adicionar Novos Louvores:

1. **Crie a pasta** seguindo o padrão válido
2. **Execute** `npm run map-assets` para mapear
3. **Verifique** se aparecem na pesquisa
4. **Se não aparecer:** verifique se o nome da pasta segue os padrões acima

## Versionamento automático

O sistema usa versionamento baseado em data + hash do conteúdo:
- **Formato:** `YYYYMMDD.HASH` (ex: `20250719.db6030da`)
- **Cache busting:** Arquivo carregado com `?v=versao`
- **Detecção automática:** Verifica atualizações a cada 5 minutos

## Deploy

1. Execute: `node scripts/build-deploy.js`
2. Envie para o servidor:
   - `assets2-louvores.js`
   - `assets2-version.json`
   - `assets2-mapping.json`
   - `.htaccess` (para Apache)

---

## 📋 Logs de atualização

- **v2.0 (Jul/2025):** Sistema de mapeamento automático com versionamento
- **v1.x:** Sistema manual com louvores.js (obsoleto)

---

## 🔧 Resolução de Problemas

### Comando `http-server` não encontrado
```bash
# Opção 1: Instalar localmente
npm install

# Opção 2: Usar npx
npx http-server . -c-1 --fallback index.html

# Opção 3: Instalar globalmente
npm install -g http-server
```

### Assets não carregam
```bash
# Verificar se arquivos existem
ls assets2-*.js assets2-*.json

# Regenerar se necessário
npm run map-assets
```

### Erro de CORS no navegador
- Use sempre um servidor HTTP (não abra index.html diretamente)
- O comando `http-server` já resolve isso automaticamente

### Performance lenta
- Execute `npm run build` para gerar versão otimizada
- Verifique cache do navegador (F12 → Network → Disable cache)