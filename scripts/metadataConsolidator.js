const fs = require('fs');
const path = require('path');

class MetadataConsolidator {
    constructor() {
        this.basePath = path.resolve(__dirname, '..');
        this.outputPath = path.join(this.basePath, 'metadata-consolidated.js');
    }

    async consolidateMetadata() {
        console.log('Iniciando consolidação de metadados...');
        
        const metadata = {
            pages: this.loadPagesMetadata(),
            louvores: this.loadLouvoresMetadata(),
            assets: this.loadAssetsMetadata(),
            generatedAt: new Date().toISOString(),
            version: '1.0.0'
        };

        this.generateConsolidatedFile(metadata);
        console.log('Metadados consolidados com sucesso!');
        
        return metadata;
    }

    loadPagesMetadata() {
        try {
            const pagesPath = path.join(this.basePath, 'pages-bar-metadados.json');
            if (fs.existsSync(pagesPath)) {
                const content = fs.readFileSync(pagesPath, 'utf8');
                const pagesData = JSON.parse(content);
                console.log(`✓ Carregados metadados de ${pagesData.pages.length} páginas`);
                return pagesData;
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar metadados das páginas:', error.message);
        }
        return { pages: [], configuracao: {} };
    }

    loadLouvoresMetadata() {
        try {
            const louvoresPath = path.join(this.basePath, 'louvoresMetadata.json');
            if (fs.existsSync(louvoresPath)) {
                const content = fs.readFileSync(louvoresPath, 'utf8');
                const louvoresData = JSON.parse(content);
                console.log(`✓ Carregados metadados de ${louvoresData.louvores?.length || 0} louvores`);
                return louvoresData;
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar metadados dos louvores:', error.message);
        }
        return { louvores: [] };
    }

    loadAssetsMetadata() {
        try {
            const assetsPath = path.join(this.basePath, 'assets2-mapping.json');
            if (fs.existsSync(assetsPath)) {
                const content = fs.readFileSync(assetsPath, 'utf8');
                const assetsData = JSON.parse(content);
                console.log(`✓ Carregados metadados dos assets`);
                return assetsData;
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar metadados dos assets:', error.message);
        }
        return { structure: {}, louvores: [] };
    }

    generateConsolidatedFile(metadata) {
        const jsContent = `// Arquivo gerado automaticamente em ${metadata.generatedAt}
// NÃO EDITE MANUALMENTE - Use os scripts de build para regenerar

window.METADATA_CONSOLIDATED = ${JSON.stringify(metadata, null, 2)};

// Função utilitária para acessar metadados
window.getMetadata = function() {
    return window.METADATA_CONSOLIDATED;
};

// Função para obter páginas da barra
window.getPagesBarData = function() {
    return window.METADATA_CONSOLIDATED.pages || { pages: [], configuracao: {} };
};

// Função para obter louvores
window.getLouvoresData = function() {
    return window.METADATA_CONSOLIDATED.louvores || { louvores: [] };
};

// Função para obter assets
window.getAssetsData = function() {
    return window.METADATA_CONSOLIDATED.assets || { structure: {}, louvores: [] };
};

console.log('✓ Metadados consolidados carregados - versão ${metadata.version}');
`;

        fs.writeFileSync(this.outputPath, jsContent, 'utf8');
        console.log(`✓ Arquivo consolidado salvo em: ${this.outputPath}`);
    }

    // Método para validar integridade dos metadados
    validateMetadata(metadata) {
        const errors = [];
        
        // Validar páginas
        if (metadata.pages && metadata.pages.pages) {
            metadata.pages.pages.forEach((page, index) => {
                if (!page.id) errors.push(`Página ${index}: ID obrigatório`);
                if (!page.nome) errors.push(`Página ${index}: Nome obrigatório`);
                if (!page.arquivo) errors.push(`Página ${index}: Arquivo obrigatório`);
                if (!page.icone) errors.push(`Página ${index}: Ícone obrigatório`);
            });
        }
        
        if (errors.length > 0) {
            console.warn('⚠️ Erros de validação encontrados:');
            errors.forEach(error => console.warn(`  - ${error}`));
        } else {
            console.log('✓ Validação de metadados concluída sem erros');
        }
        
        return errors.length === 0;
    }
}

// Execução direta se chamado via linha de comando
if (require.main === module) {
    const consolidator = new MetadataConsolidator();
    consolidator.consolidateMetadata()
        .then(metadata => {
            consolidator.validateMetadata(metadata);
            console.log('🎉 Consolidação de metadados concluída com sucesso!');
        })
        .catch(error => {
            console.error('❌ Erro durante a consolidação:', error);
            process.exit(1);
        });
}

module.exports = MetadataConsolidator;
