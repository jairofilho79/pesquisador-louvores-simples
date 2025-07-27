// Script para gerar códigos únicos determinísticos para louvores
// Sistema robusto baseado em nível 1 + nível 2 sem mapeamento prévio

/**
 * Gera um prefixo de 3 caracteres baseado no nome da categoria
 * Algoritmo determinístico que sempre gera o mesmo prefixo para o mesmo input
 * @param {string} nomeCategoria - Nome da pasta de nível 1
 * @returns {string} - Prefixo de 3 caracteres (ex: "CPE", "DIV")
 */
function generateCategoryPrefix(nomeCategoria) {
    // Normalizar o nome da categoria
    const normalized = nomeCategoria
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove acentos
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, "") // Remove caracteres especiais
        .trim();
    
    // Extrair palavras significativas
    const words = normalized.split(/\s+/).filter(word => word.length > 0);
    
    let prefix = '';
    
    if (words.length === 0) {
        // Fallback se não há palavras válidas
        prefix = 'TMP';
    } else if (words.length === 1) {
        // Uma palavra: pegar primeiras 3 letras
        prefix = words[0].substring(0, 3).padEnd(3, 'X');
    } else {
        // Múltiplas palavras: estratégia inteligente
        
        // Filtrar palavras muito pequenas (conectivos) mas preservar siglas importantes
        const significantWords = words.filter(word => 
            word.length >= 3 || 
            ['CIA', 'CIAS', 'PES', 'GLT', 'GLTM'].includes(word)
        );
        
        if (significantWords.length >= 2) {
            // Usar primeira letra de cada palavra significativa
            prefix = significantWords
                .slice(0, 3)
                .map(word => word[0])
                .join('')
                .padEnd(3, 'X');
        } else if (significantWords.length === 1) {
            // Uma palavra significativa: usar suas primeiras 3 letras
            prefix = significantWords[0].substring(0, 3).padEnd(3, 'X');
        } else {
            // Fallback: primeira letra de cada palavra
            prefix = words
                .slice(0, 3)
                .map(word => word[0])
                .join('')
                .padEnd(3, 'X');
        }
    }
    
    // Garantir que sempre tenha 3 caracteres
    prefix = prefix.substring(0, 3).padEnd(3, 'X');
    
    return prefix;
}

/**
 * Extrai o número da pasta de nível 2
 * @param {string} nomePastaNivel2 - Nome da pasta de nível 2
 * @returns {string} - Número formatado (ex: "055", "001")
 */
function extractNumberFromFolder(nomePastaNivel2) {
    // Tentar extrair número do início do nome
    const numeroMatch = nomePastaNivel2.match(/^(\d+)/);
    
    if (numeroMatch) {
        // Número encontrado: formatar com 3 dígitos
        return numeroMatch[1].padStart(3, '0');
    }
    
    // Fallback: usar hash determinístico do nome
    let hash = 0;
    for (let i = 0; i < nomePastaNivel2.length; i++) {
        const char = nomePastaNivel2.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Converter para 32bit integer
    }
    
    // Garantir que seja positivo e entre 1-999
    const numero = Math.abs(hash) % 999 + 1;
    return numero.toString().padStart(3, '0');
}

/**
 * Gera código único determinístico baseado na estrutura de pastas
 * @param {string} caminhoCompleto - Caminho completo do louvor
 * @returns {string} - Código único (ex: "CPE055", "DIV001")
 */
function generateDeterministicCode(caminhoCompleto) {
    // Extrair partes do caminho
    // Exemplo: "assets2/Louvores Coletânea (PES)/055 - Senhor meu Deus/arquivo.pdf"
    const pathParts = caminhoCompleto.split('/').filter(part => part && part !== 'assets2');
    
    if (pathParts.length < 2) {
        console.warn(`Caminho inválido: ${caminhoCompleto}`);
        return null;
    }
    
    const categoria = pathParts[0]; // "Louvores Coletânea (PES)"
    const nomePasta = pathParts[1]; // "055 - Senhor meu Deus"
    
    // Gerar prefixo da categoria
    const prefixo = generateCategoryPrefix(categoria);
    
    // Extrair número da pasta
    const numero = extractNumberFromFolder(nomePasta);
    
    // Combinar para formar código único
    const codigo = `${prefixo}${numero}`;
    
    return codigo;
}

/**
 * Processa todos os louvores e gera códigos únicos
 * @param {Array} louvores - Array de louvores do assets2-louvores.js  
 * @returns {Array} - Array de louvores com códigos únicos adicionados
 */
function processLouvoresWithCodes(louvores) {
    const processedLouvores = [];
    const codeMapping = new Map(); // Para verificar duplicatas
    const categoryStats = new Map(); // Para estatísticas
    
    console.log('🚀 Iniciando geração de códigos únicos determinísticos...');
    console.log(`📊 Total de louvores para processar: ${louvores.length}`);
    
    louvores.forEach((louvor, index) => {
        let codigo = generateDeterministicCode(louvor.caminhoCompleto);
        
        if (!codigo) {
            console.warn(`❌ Louvor ${index + 1}: Código não gerado para "${louvor.caminhoCompleto}"`);
            processedLouvores.push(louvor); // Manter sem código
            return;
        }
        
        // Verificar duplicatas
        if (codeMapping.has(codigo)) {
            console.warn(`⚠️ DUPLICATA: Código ${codigo} já existe!`);
            console.warn(`   Anterior: ${codeMapping.get(codigo).caminhoCompleto}`);
            console.warn(`   Atual: ${louvor.caminhoCompleto}`);
            
            // Gerar código alternativo adicionando sufixo alfabético
            let suffixCounter = 1;
            let originalCode = codigo;
            
            do {
                const suffix = String.fromCharCode(65 + (suffixCounter - 1) % 26); // A, B, C...
                codigo = suffixCounter <= 26 ? 
                    `${originalCode.substring(0, 5)}${suffix}` : // Substitui último char
                    `${originalCode}${suffixCounter - 26}`; // Usa números após Z
                suffixCounter++;
            } while (codeMapping.has(codigo) && suffixCounter < 100);
            
            if (suffixCounter >= 100) {
                console.error(`🚨 Muitas duplicatas para ${originalCode}! Pulando...`);
                processedLouvores.push(louvor); // Manter sem código
                return;
            }
            
            console.log(`   Código alternativo: ${codigo}`);
        }
        
        // Extrair categoria para estatísticas
        const pathParts = louvor.caminhoCompleto.split('/').filter(part => part && part !== 'assets2');
        const categoria = pathParts[0] || 'Desconhecida';
        
        // Atualizar estatísticas
        if (!categoryStats.has(categoria)) {
            categoryStats.set(categoria, { 
                count: 0, 
                prefix: generateCategoryPrefix(categoria),
                codes: [] 
            });
        }
        const stats = categoryStats.get(categoria);
        stats.count++;
        stats.codes.push(codigo);
        
        codeMapping.set(codigo, {
            nome: louvor.nome,
            categoria: categoria,
            caminhoCompleto: louvor.caminhoCompleto,
            index: index + 1
        });
        
        // Adicionar código único ao louvor
        const louvorComCodigo = {
            ...louvor,
            codigo: codigo,
            categoria: categoria // Também adicionar categoria explícita
        };
        
        processedLouvores.push(louvorComCodigo);
        
        // Log progresso a cada 100 louvores
        if ((index + 1) % 100 === 0) {
            console.log(`📈 Processados: ${index + 1}/${louvores.length} louvores`);
        }
    });
    
    console.log('\n✅ Geração de códigos concluída!');
    console.log('📈 Estatísticas por categoria:');
    
    // Ordenar categorias por nome para exibição
    const sortedCategories = Array.from(categoryStats.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    
    sortedCategories.forEach(([categoria, stats]) => {
        console.log(`   ${stats.prefix}: ${stats.count} louvores (${categoria})`);
        
        // Mostrar alguns códigos de exemplo
        const exampleCodes = stats.codes.slice(0, 3);
        if (exampleCodes.length > 0) {
            console.log(`      Exemplos: ${exampleCodes.join(', ')}${stats.codes.length > 3 ? '...' : ''}`);
        }
    });
    
    console.log(`\n🎯 Total de códigos gerados: ${codeMapping.size}`);
    console.log(`📋 Total de louvores processados: ${processedLouvores.length}`);
    
    return processedLouvores;
}

/**
 * Salva os louvores com códigos em um novo arquivo
 * @param {Array} louvoresComCodigos - Array de louvores processados
 * @param {string} outputPath - Caminho do arquivo de saída
 */
function saveLouvoresWithCodes(louvoresComCodigos, outputPath = 'assets2-louvores-com-codigos.js') {
    const timestamp = new Date().toISOString();
    const version = timestamp.split('T')[0].replace(/-/g, '') + '.' + Math.random().toString(36).substring(2, 10);
    
    const fileContent = `// Louvores com códigos únicos determinísticos gerados
// Gerado em: ${timestamp}
// Versão: ${version}
// Total de louvores: ${louvoresComCodigos.length}
// Sistema de códigos: [PREFIXO_CATEGORIA][NUMERO_PASTA] (6 caracteres)

window.louvoresAssets2ComCodigos = ${JSON.stringify(louvoresComCodigos, null, 2)};

// Função utilitária para buscar louvor por código
window.buscarLouvorPorCodigo = function(codigo) {
    return window.louvoresAssets2ComCodigos.find(louvor => louvor.codigo === codigo);
};

// Função utilitária para listar códigos por categoria
window.listarCodigosPorCategoria = function(categoria) {
    return window.louvoresAssets2ComCodigos
        .filter(louvor => louvor.categoria === categoria)
        .map(louvor => ({ codigo: louvor.codigo, nome: louvor.nome }));
};

// Função utilitária para validar código
window.validarCodigo = function(codigo) {
    return /^[A-Z]{3}\\d{3}[A-Z]?$/.test(codigo);
};

// Função para gerar prefixo de categoria (disponível no browser)
window.generateCategoryPrefix = ${generateCategoryPrefix.toString()};

// Função para extrair número de pasta (disponível no browser)
window.extractNumberFromFolder = ${extractNumberFromFolder.toString()};

// Função para gerar código determinístico (disponível no browser)
window.generateDeterministicCode = ${generateDeterministicCode.toString()};
`;

    return fileContent;
}

// Função principal para executar o script
async function main() {
    try {
        console.log('🔧 Carregando dados dos louvores...');
        
        // Tentar carregar o arquivo assets2-louvores.js
        const fs = require('fs');
        const path = require('path');
        
        const louvoresPath = path.join(__dirname, '..', 'assets2-louvores.js');
        
        if (!fs.existsSync(louvoresPath)) {
            console.error('❌ Arquivo assets2-louvores.js não encontrado!');
            console.log('📁 Procurando em:', louvoresPath);
            return;
        }
        
        // Ler o arquivo JavaScript
        let fileContent = fs.readFileSync(louvoresPath, 'utf8');
        
        // Simular ambiente do browser no Node.js
        global.window = global.window || {};
        global.louvoresAssets2 = undefined;
        
        // Substituir window.louvoresAssets2 por global.louvoresAssets2 temporariamente
        fileContent = fileContent.replace(/window\.louvoresAssets2/g, 'global.louvoresAssets2');
        
        // Executar o arquivo modificado
        eval(fileContent);
        
        if (typeof global.louvoresAssets2 === 'undefined') {
            console.error('❌ Variável louvoresAssets2 não encontrada no arquivo!');
            return;
        }
        
        console.log(`✅ Dados carregados: ${global.louvoresAssets2.length} louvores`);
        
        // Processar louvores
        const louvoresComCodigos = processLouvoresWithCodes(global.louvoresAssets2);
        
        // Salvar arquivo de saída
        const outputContent = saveLouvoresWithCodes(louvoresComCodigos);
        const outputPath = path.join(__dirname, '..', 'assets2-louvores-com-codigos.js');
        
        fs.writeFileSync(outputPath, outputContent, 'utf8');
        
        console.log('\n🎉 Processo concluído com sucesso!');
        console.log(`📂 Arquivo salvo em: ${outputPath}`);
        
        // Testar alguns exemplos
        console.log('\n🧪 Exemplos de códigos gerados:');
        console.log('   "Louvores Coletânea (PES)" → Prefixo:', generateCategoryPrefix('Louvores Coletânea (PES)'));
        console.log('   "Louvores Avulsos (Diversos)" → Prefixo:', generateCategoryPrefix('Louvores Avulsos (Diversos)'));
        console.log('   "Repertório GLTM" → Prefixo:', generateCategoryPrefix('Repertório GLTM'));
        
        // Limpar global após uso
        delete global.window;
        delete global.louvoresAssets2;
        
    } catch (error) {
        console.error('❌ Erro durante o processamento:', error);
    }
}

// Exportar funções para uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateCategoryPrefix,
        extractNumberFromFolder,
        generateDeterministicCode,
        processLouvoresWithCodes,
        saveLouvoresWithCodes
    };
}

// Para uso no browser
if (typeof window !== 'undefined') {
    window.CodigoUnicoGenerator = {
        generateCategoryPrefix,
        extractNumberFromFolder,
        generateDeterministicCode,
        processLouvoresWithCodes,
        saveLouvoresWithCodes
    };
}

// Executar se chamado diretamente
if (require.main === module) {
    main();
}
