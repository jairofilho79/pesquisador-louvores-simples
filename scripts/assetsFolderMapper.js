// Script Node.js para mapear a pasta assets2 e gerar um arquivo JSON
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AssetsFolderMapper {
    constructor() {
        this.basePath = path.resolve(__dirname, '../assets2');
        this.audioExtensions = ['.mp3', '.wav', '.mid', '.midi', '.m4a', '.aac', '.ogg'];
        this.pdfExtension = '.pdf';
    }

    async mapAssets() {
        console.log('Iniciando mapeamento de assets2...');
        
        if (!fs.existsSync(this.basePath)) {
            console.error('Pasta assets2 não encontrada:', this.basePath);
            process.exit(1);
        }

        const structure = this.scanDirectorySync(this.basePath);
        const louvores = this.extractLouvoresFromStructure(structure);
        
        // Validar padrões de nomenclatura
        this.validateNamingPatterns(structure);
        
        console.log(`Mapeamento concluído: ${louvores.length} louvores encontrados`);
        
        return {
            structure: structure,
            louvores: louvores,
            generatedAt: new Date().toISOString()
        };
    }

    scanDirectorySync(dirPath) {
        const relativePath = path.relative(path.resolve(__dirname, '..'), dirPath);
        const structure = {
            path: relativePath.replace(/\\/g, '/'),
            name: path.basename(dirPath),
            subdirectories: {},
            pdfs: [],
            // audios: [], // REMOVIDO - não coletamos mais áudios
            otherFiles: []
        };

        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    structure.subdirectories[item] = this.scanDirectorySync(itemPath);
                } else {
                    const extension = path.extname(item).toLowerCase();
                    
                    if (extension === this.pdfExtension) {
                        structure.pdfs.push(item);
                    } else if (this.audioExtensions.includes(extension)) {
                        // IGNORAR ARQUIVOS DE ÁUDIO - não adicionar à estrutura
                        console.log(`Ignorando arquivo de áudio: ${item}`);
                    } else {
                        structure.otherFiles.push(item);
                    }
                }
            }
        } catch (error) {
            console.warn('Erro ao ler diretório:', dirPath, error.message);
        }

        return structure;
    }

    extractLouvoresFromStructure(structure, parentPath = '') {
        const louvores = [];
        const currentPath = parentPath ? `${parentPath}/${structure.name}` : structure.name;

        // Lista de pastas que são de instrumentos/organização e não louvores
        const instrumentFolders = [
            'Cordas', 'Madeiras', 'Metais', 'VOZES MIDI', 'Percussão', 
            'Teclado', 'Baixo', 'Guitarra', 'Violão', 'Bateria',
            'Cordas-Madeiras- Metais', 'Instrumentos', 'Vozes', 'Partituras'
        ];

        // Se esta pasta contém PDFs e não é uma pasta de instrumentos, criar um louvor
        if (structure.pdfs.length > 0 && !instrumentFolders.includes(structure.name)) {
            const louvor = this.createLouvorFromFolder(structure, currentPath);
            if (louvor) {
                louvores.push(louvor);
            }
        }

        // Recursivamente processar subdiretórios
        Object.values(structure.subdirectories).forEach(subDir => {
            const subLouvores = this.extractLouvoresFromStructure(subDir, currentPath);
            louvores.push(...subLouvores);
        });

        return louvores;
    }

    createLouvorFromFolder(structure, pathFromRoot) {
        const folderName = structure.name;
        const metadata = this.extractMetadataFromName(folderName);

        // Mapear subpastas recursivamente
        const subfolders = this.mapSubfolders(structure, pathFromRoot);

        return {
            nome: metadata.nome,
            classificacao: metadata.classificacao || '',
            categoria: metadata.categoria || '',
            numero: metadata.numero,
            status: metadata.status || '',
            caminhoCompleto: pathFromRoot,
            pdfs: structure.pdfs.map(pdf => `${pathFromRoot}/${pdf}`),
            // audios: structure.audios.map(audio => `${pathFromRoot}/${audio}`), // REMOVIDO
            // NOVO: Estrutura de subpastas
            subfolders: subfolders,
            hasSubfolders: subfolders.length > 0,
            totalFiles: this.countTotalFiles(structure),
            // Manter compatibilidade com sistema atual
            pdf: structure.pdfs.length > 0 ? structure.pdfs[0] : ''
        };
    }

    mapSubfolders(structure, parentPath) {
        const subfolders = [];
        
        Object.entries(structure.subdirectories).forEach(([name, subStructure]) => {
            const subPath = `${parentPath}/${name}`;
            
            const subfolder = {
                name: name,
                path: subPath,
                pdfs: subStructure.pdfs.map(pdf => `${subPath}/${pdf}`),
                // audios: subStructure.audios.map(audio => `${subPath}/${audio}`), // REMOVIDO
                totalFiles: subStructure.pdfs.length, // Apenas PDFs agora
                children: this.mapSubfolders(subStructure, subPath) // Recursivo
            };
            
            // Só adicionar se tem arquivos ou subpastas com arquivos
            if (subfolder.totalFiles > 0 || subfolder.children.length > 0) {
                subfolders.push(subfolder);
            }
        });
        
        return subfolders;
    }

    countTotalFiles(structure) {
        let total = structure.pdfs.length; // Apenas PDFs agora (áudios removidos)
        
        // Contar arquivos em subpastas recursivamente
        Object.values(structure.subdirectories).forEach(subStructure => {
            total += this.countTotalFiles(subStructure);
        });
        
        return total;
    }

    extractMetadataFromName(name) {
        const metadata = {
            nome: name,
            numero: null,
            status: null,
            classificacao: null,
            categoria: null
        };

        // Extrair número do início (ex: "001 - [V] Nome" -> 1)
        const numeroMatch = name.match(/^(\d+)\s*-\s*/);
        if (numeroMatch) {
            metadata.numero = parseInt(numeroMatch[1]);
        }

        // Extrair status [V], [A], [P]
        const statusMatch = name.match(/\[([VAP])\]/);
        if (statusMatch) {
            metadata.status = statusMatch[1];
        }

        // Limpar nome removendo número e status
        let cleanName = name.replace(/^\d+\s*-\s*/, ''); // Remove número
        cleanName = cleanName.replace(/\[([VAP])\]\s*/, ''); // Remove status
        cleanName = cleanName.trim();

        metadata.nome = cleanName;

        return metadata;
    }

    async saveToFile(data, filename = 'assets2-mapping.json') {
        const outputPath = path.resolve(__dirname, '..', filename);
        
        try {
            fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');
            console.log('Mapeamento salvo em:', outputPath);
        } catch (error) {
            console.error('Erro ao salvar arquivo:', error);
        }
    }

    async generateJavaScriptFile(louvores, filename = 'assets2-louvores.js') {
        const outputPath = path.resolve(__dirname, '..', filename);
        
        // Gerar hash do conteúdo para versionamento
        const contentHash = crypto.createHash('md5')
            .update(JSON.stringify(louvores))
            .digest('hex')
            .substring(0, 8);
        
        const version = `${new Date().toISOString().split('T')[0].replace(/-/g, '')}.${contentHash}`;
        
        const jsContent = `// Louvores mapeados automaticamente da pasta assets2
// Gerado em: ${new Date().toISOString()}
// Versão: ${version}
// Total de louvores: ${louvores.length}

window.louvoresAssets2 = ${JSON.stringify(louvores, null, 2)};

// Metadados da versão
window.louvoresAssets2Meta = {
    version: "${version}",
    generatedAt: "${new Date().toISOString()}",
    totalLouvores: ${louvores.length},
    contentHash: "${contentHash}"
};

// Função para carregar os dados (retrocompatibilidade)
if (typeof window !== 'undefined') {
    console.log('Louvores Assets2 carregados:', window.louvoresAssets2.length, 'louvores');
    console.log('Versão:', window.louvoresAssets2Meta.version);
}
`;

        try {
            fs.writeFileSync(outputPath, jsContent, 'utf8');
            console.log('Arquivo JavaScript gerado em:', outputPath);
            console.log('Versão:', version);
            
            // Atualizar arquivo de versionamento
            this.updateVersionFile(version, contentHash, louvores.length);
            
        } catch (error) {
            console.error('Erro ao gerar arquivo JavaScript:', error);
        }
    }

    updateVersionFile(version, contentHash, totalLouvores) {
        const versionInfo = {
            currentVersion: version,
            contentHash: contentHash,
            totalLouvores: totalLouvores,
            generatedAt: new Date().toISOString(),
            filename: `assets2-louvores.js?v=${version}`
        };

        const versionPath = path.resolve(__dirname, '..', 'assets2-version.json');
        
        try {
            fs.writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2), 'utf8');
            console.log('Arquivo de versão atualizado:', versionPath);
        } catch (error) {
            console.error('Erro ao atualizar arquivo de versão:', error);
        }
    }

    /**
     * Valida se as pastas de nível 2 seguem padrões de nomenclatura válidos
     * para que apareçam corretamente na busca
     */
    validateNamingPatterns(structure, level = 0, parentPath = '') {
        const currentPath = parentPath ? `${parentPath}/${structure.name}` : structure.name;
        
        // Verificar apenas nível 2 (louvores)
        if (level === 2) {
            const isValid = this.isLouvorNameValid(structure.name);
            if (!isValid && structure.pdfs.length > 0) {
                console.warn(`⚠️  PADRÃO INVÁLIDO: "${currentPath}"`);
                console.warn(`   Pasta não aparecerá na pesquisa - use padrões válidos:`);
                console.warn(`   ✅ "001 - [P] Nome do Louvor"`);
                console.warn(`   ✅ "[P] Nome do Louvor"`);
                console.warn('');
            }
        }
        
        // Validar subdiretórios recursivamente
        Object.values(structure.subdirectories).forEach(subDir => {
            this.validateNamingPatterns(subDir, level + 1, currentPath);
        });
    }

    /**
     * Verifica se o nome da pasta segue os padrões válidos de louvor
     * PADRÕES VÁLIDOS:
     * - "001 - [P] Nome do Louvor" (número + status no meio)
     * - "[P] Nome do Louvor" (apenas status no início, sem número)
     */
    isLouvorNameValid(nomePasta) {
        const padroes = [
            /^\d+\s*-\s*\[.\]\s*.+/,            // Número - [Status] Nome (status no meio)
            /^\[.\]\s*.+/                       // [Status] Nome (apenas status no início)
        ];
        
        return padroes.some(padrao => padrao.test(nomePasta));
    }
}

async function main() {
    const mapper = new AssetsFolderMapper();
    
    try {
        const result = await mapper.mapAssets();
        
        // Salvar estrutura completa como JSON
        await mapper.saveToFile(result, 'assets2-mapping.json');
        
        // Gerar arquivo JavaScript com os louvores
        await mapper.generateJavaScriptFile(result.louvores, 'assets2-louvores.js');
        
        // NOVO: Consolidar metadados de páginas e outros
        console.log('\n=== Consolidando Metadados ===');
        const MetadataConsolidator = require('./metadataConsolidator.js');
        const consolidator = new MetadataConsolidator();
        await consolidator.consolidateMetadata();
        
        console.log('\n=== Resumo ===');
        console.log(`Total de louvores: ${result.louvores.length}`);
        console.log(`Gerado em: ${result.generatedAt}`);
        
        // Mostrar alguns exemplos
        console.log('\n=== Exemplos ===');
        result.louvores.slice(0, 3).forEach((louvor, index) => {
            console.log(`${index + 1}. ${louvor.nome}`);
            console.log(`   Número: ${louvor.numero || 'N/A'}`);
            console.log(`   Status: ${louvor.status || 'N/A'}`);
            console.log(`   PDFs: ${louvor.pdfs.length}`);
            // console.log(`   Áudios: ${louvor.audios.length}`); // REMOVIDO - não temos mais áudios
            console.log('');
        });
        
    } catch (error) {
        console.error('Erro durante o mapeamento:', error);
        process.exit(1);
    }
}

// Executar se for chamado diretamente
if (require.main === module) {
    main();
}

module.exports = AssetsFolderMapper;
