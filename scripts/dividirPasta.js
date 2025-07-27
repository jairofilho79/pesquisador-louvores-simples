const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PastaDivider {
    constructor(pastaPaths, batchSize = 200, autoPush = false) {
        this.pastaPaths = Array.isArray(pastaPaths) ? pastaPaths : [pastaPaths];
        this.batchSize = batchSize;
        this.autoPush = autoPush;
        this.totalFiles = 0;
        this.processedFiles = 0;
        this.gitignorePatterns = this.loadGitignorePatterns();
        this.logFilePath = this.createLogFile();
    }

    // Criar arquivo de log para falhas
    createLogFile() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const logPath = path.join('.', `dividir-pasta-log-${timestamp}.txt`);
        
        // Criar cabeçalho do log
        const header = `=== LOG DE FALHAS - DIVISÃO DE PASTAS ===
Data: ${new Date().toLocaleString('pt-BR')}
Configuração: ${this.batchSize} arquivos por batch
Pastas: ${this.pastaPaths.join(', ')}

=== BATCHES COM FALHAS ===

`;
        
        try {
            fs.writeFileSync(logPath, header, 'utf8');
            console.log(`📝 Arquivo de log criado: ${logPath}`);
        } catch (error) {
            console.warn(`⚠️  Erro ao criar arquivo de log: ${error.message}`);
        }
        
        return logPath;
    }

    // Registrar falha no log
    logBatchFailure(batchNumber, totalBatches, batchFiles, error) {
        const logEntry = `BATCH ${batchNumber}/${totalBatches} - FALHOU
Erro: ${error.message}
Data/Hora: ${new Date().toLocaleString('pt-BR')}
Arquivos (${batchFiles.length}):
${batchFiles.map(file => `  - ${file}`).join('\n')}

---

`;
        
        try {
            fs.appendFileSync(this.logFilePath, logEntry, 'utf8');
        } catch (logError) {
            console.warn(`⚠️  Erro ao escrever no log: ${logError.message}`);
        }
    }

    // Carregar padrões do .gitignore
    loadGitignorePatterns() {
        const patterns = [];
        try {
            const gitignorePath = path.join('.', '.gitignore');
            if (fs.existsSync(gitignorePath)) {
                const content = fs.readFileSync(gitignorePath, 'utf8');
                const lines = content.split('\n')
                    .map(line => line.trim())
                    .filter(line => line && !line.startsWith('#'));
                
                for (const line of lines) {
                    // Converter padrões do gitignore para regex
                    let pattern = line.replace(/\\/g, '/'); // Normalizar separadores
                    pattern = pattern.replace(/\*\*/g, '___DOUBLESTAR___');
                    pattern = pattern.replace(/\*/g, '[^/]*');
                    pattern = pattern.replace(/___DOUBLESTAR___/g, '.*');
                    pattern = pattern.replace(/\./g, '\\.');
                    
                    if (pattern.startsWith('/')) {
                        pattern = '^' + pattern.slice(1);
                    } else {
                        pattern = '(^|/)' + pattern;
                    }
                    
                    patterns.push(new RegExp(pattern + '($|/)'));
                }
            }
        } catch (error) {
            console.warn(`⚠️  Erro ao carregar .gitignore: ${error.message}`);
        }
        return patterns;
    }

    // Verificar se arquivo deve ser ignorado
    shouldIgnoreFile(filePath) {
        const normalizedPath = filePath.replace(/\\/g, '/');
        
        // Verificar extensões de áudio explicitamente (lista completa)
        const audioExtensions = [
            '.mp3', '.wav', '.m4a', '.aac', '.flac', 
            '.ogg', '.wma', '.mid', '.midi', '.mpeg', '.mpg'
        ];
        const ext = path.extname(normalizedPath).toLowerCase();
        if (audioExtensions.includes(ext)) {
            return true;
        }
        
        // Verificar padrões do gitignore
        return this.gitignorePatterns.some(pattern => pattern.test(normalizedPath));
    }

    // Obter arquivos já commitados no repositório
    getCommittedFiles() {
        try {
            console.log('🔍 Verificando arquivos já commitados...');
            const output = execSync('git ls-files', { encoding: 'utf8', stdio: 'pipe' });
            const committedFiles = new Set(
                output.split('\n')
                    .map(file => file.trim())
                    .filter(file => file.length > 0)
                    .map(file => path.normalize(file))
            );
            console.log(`📋 ${committedFiles.size} arquivos já estão no repositório`);
            return committedFiles;
        } catch (error) {
            console.warn(`⚠️  Erro ao verificar arquivos commitados: ${error.message}`);
            return new Set();
        }
    }

    // Verificar se um arquivo já foi commitado
    isFileCommitted(filePath, committedFiles) {
        const normalizedPath = path.normalize(filePath);
        return committedFiles.has(normalizedPath);
    }

    // Descobrir todas as pastas do assets2
    discoverAssets2Folders() {
        const assets2Path = path.join('.', 'assets2');
        const folders = [];
        
        try {
            if (fs.existsSync(assets2Path)) {
                const items = fs.readdirSync(assets2Path);
                for (const item of items) {
                    const fullPath = path.join(assets2Path, item);
                    if (fs.statSync(fullPath).isDirectory()) {
                        folders.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.warn(`⚠️  Erro ao descobrir pastas do assets2: ${error.message}`);
        }
        
        return folders;
    }

    // Obter todos os arquivos da pasta recursivamente
    getAllFiles(dirPath, arrayOfFiles = [], committedFiles = null) {
        try {
            const files = fs.readdirSync(dirPath);

            files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                const relativePath = path.relative('.', fullPath);
                
                if (fs.statSync(fullPath).isDirectory()) {
                    arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles, committedFiles);
                } else {
                    // Verificar se o arquivo deve ser ignorado
                    if (!this.shouldIgnoreFile(relativePath)) {
                        // Se committedFiles foi fornecido, verificar se arquivo já foi commitado
                        if (committedFiles === null || !this.isFileCommitted(relativePath, committedFiles)) {
                            arrayOfFiles.push(relativePath);
                        }
                    }
                }
            });
        } catch (error) {
            console.warn(`⚠️  Erro ao ler diretório ${dirPath}: ${error.message}`);
        }

        return arrayOfFiles;
    }

    // Criar batches de arquivos de todas as pastas (com suporte a resumo)
    createBatches(enableResume = false) {
        const allFiles = [];
        let committedFiles = null;
        let totalFilesBeforeFilter = 0;
        let alreadyCommittedCount = 0;
        
        // Se resumo estiver habilitado, obter arquivos já commitados
        if (enableResume) {
            committedFiles = this.getCommittedFiles();
        }
        
        // Coletar arquivos de todas as pastas
        this.pastaPaths.forEach(pastaPath => {
            // Primeiro, obter todos os arquivos (incluindo já commitados) para estatísticas
            const allPastaFiles = this.getAllFiles(pastaPath);
            totalFilesBeforeFilter += allPastaFiles.length;
            
            // Depois, obter apenas os arquivos pendentes (se resumo estiver habilitado)
            const pastaFiles = this.getAllFiles(pastaPath, [], committedFiles);
            const alreadyCommittedInPasta = allPastaFiles.length - pastaFiles.length;
            alreadyCommittedCount += alreadyCommittedInPasta;
            
            console.log(`📂 ${pastaPath}: ${pastaFiles.length} arquivos pendentes${enableResume ? ` (${alreadyCommittedInPasta} já commitados)` : ''}`);
            allFiles.push(...pastaFiles);
        });
        
        this.totalFiles = allFiles.length;
        const batches = [];
        
        console.log(`📊 Total de arquivos pendentes: ${this.totalFiles}`);
        if (enableResume && alreadyCommittedCount > 0) {
            console.log(`✅ Arquivos já commitados: ${alreadyCommittedCount}`);
            console.log(`📈 Progresso atual: ${((alreadyCommittedCount / totalFilesBeforeFilter) * 100).toFixed(1)}%`);
        }
        console.log(`🚫 Arquivos ignorados (áudios e outros): verificados pelo gitignore`);
        
        // Dividir em batches
        for (let i = 0; i < allFiles.length; i += this.batchSize) {
            const batch = allFiles.slice(i, i + this.batchSize);
            batches.push(batch);
        }

        return batches;
    }

    // Executar um batch com tratamento robusto de erros
    async executeBatch(batchFiles, batchNumber, totalBatches, pastasNames) {
        console.log(`\n🚀 Executando batch ${batchNumber}/${totalBatches} das pastas ${pastasNames}`);
        console.log(`📁 Arquivos neste batch: ${batchFiles.length}`);
        
        try {
            // Adicionar arquivos ao git um por um para evitar problemas de encoding
            console.log('📤 Adicionando arquivos ao git...');
            let addedCount = 0;
            let failedFiles = [];
            
            for (const file of batchFiles) {
                try {
                    execSync(`git add "${file}"`, { stdio: 'pipe' });
                    addedCount++;
                } catch (addError) {
                    console.warn(`⚠️  Erro ao adicionar ${file}: ${addError.message}`);
                    failedFiles.push(file);
                }
            }

            if (addedCount === 0) {
                console.log('⚠️  Nenhum arquivo foi adicionado. Pulando este batch.');
                if (failedFiles.length > 0) {
                    console.log(`❌ Batch ${batchNumber} pulado - ${failedFiles.length} arquivos falharam`);
                    this.logBatchFailure(batchNumber, totalBatches, failedFiles, new Error('Nenhum arquivo pôde ser adicionado'));
                }
                return { success: true, skipped: true, addedCount: 0, failedCount: failedFiles.length };
            }

            // Fazer commit
            const commitMessage = `feat: adicionar batch ${batchNumber}/${totalBatches} das pastas ${pastasNames} (${addedCount} arquivos)`;
            console.log('💾 Fazendo commit...');
            
            try {
                execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
            } catch (commitError) {
                console.error(`❌ Erro no commit do batch ${batchNumber}: ${commitError.message}`);
                this.logBatchFailure(batchNumber, totalBatches, batchFiles, commitError);
                return { success: false, skipped: false, addedCount, failedCount: failedFiles.length, error: commitError };
            }

            // Fazer push se autoPush estiver habilitado
            if (this.autoPush) {
                console.log('🚀 Fazendo push...');
                try {
                    execSync('git push origin main', { stdio: 'inherit' });
                    console.log('✅ Push realizado com sucesso!');
                } catch (pushError) {
                    console.warn(`⚠️  Erro no push do batch ${batchNumber}: ${pushError.message}`);
                    console.log('📝 Continue manualmente com: git push origin main');
                    // Push não é crítico, não consideramos como falha do batch
                }
            }

            this.processedFiles += addedCount;
            const progress = ((this.processedFiles / this.totalFiles) * 100).toFixed(1);
            console.log(`✅ Batch ${batchNumber} concluído! Progresso: ${progress}% (${this.processedFiles}/${this.totalFiles})`);
            
            if (failedFiles.length > 0) {
                console.log(`⚠️  ${failedFiles.length} arquivos falharam neste batch (mas batch foi commitado)`);
            }

            return { success: true, skipped: false, addedCount, failedCount: failedFiles.length };
            
        } catch (error) {
            console.error(`❌ Erro crítico no batch ${batchNumber}: ${error.message}`);
            this.logBatchFailure(batchNumber, totalBatches, batchFiles, error);
            return { success: false, skipped: false, addedCount: 0, failedCount: batchFiles.length, error };
        }
    }

    // Executar todo o processo
    async run(pastasNames, enableResume = false) {
        console.log(`🎯 Dividindo pastas ${pastasNames} em commits menores...\n`);
        
        const batches = this.createBatches(enableResume);
        
        if (batches.length === 0) {
            console.log('🎉 Todos os arquivos já foram commitados! Nada para processar.');
            return true;
        }
        
        console.log(`\n📦 Total de batches criados: ${batches.length}`);
        console.log(`📊 Média de arquivos por batch: ${Math.round(this.totalFiles / batches.length)}`);

        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;
        let totalFilesProcessed = 0;
        let totalFilesFailed = 0;

        for (let i = 0; i < batches.length; i++) {
            const batchNumber = i + 1;
            const result = await this.executeBatch(batches[i], batchNumber, batches.length, pastasNames);
            
            if (result.success) {
                if (result.skipped) {
                    skippedCount++;
                    console.log(`⏭️  Batch ${batchNumber} pulado`);
                } else {
                    successCount++;
                }
                totalFilesProcessed += result.addedCount;
                totalFilesFailed += result.failedCount;
            } else {
                failCount++;
                totalFilesFailed += result.failedCount;
                console.log(`❌ Batch ${batchNumber} falhou - continuando com próximo batch...`);
                // NÃO QUEBRAR MAIS - continuar processando
            }

            // Pequena pausa entre batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Finalizar arquivo de log
        this.finalizeBatchLog(successCount, failCount, skippedCount, totalFilesProcessed, totalFilesFailed);

        console.log('\n🎉 Processo concluído!');
        console.log(`✅ Batches bem-sucedidos: ${successCount}`);
        console.log(`⏭️  Batches pulados: ${skippedCount}`);
        console.log(`❌ Batches com falha: ${failCount}`);
        console.log(`📊 Arquivos processados: ${totalFilesProcessed}`);
        console.log(`⚠️  Arquivos com falha: ${totalFilesFailed}`);
        
        if (failCount > 0 || totalFilesFailed > 0) {
            console.log(`📝 Detalhes das falhas salvos em: ${this.logFilePath}`);
        }
        
        if (successCount > 0 && !this.autoPush) {
            console.log('\n🚀 Para enviar todos os commits para o GitHub, execute:');
            console.log('git push origin main');
        }
        
        return { 
            success: failCount === 0, 
            totalProcessed: totalFilesProcessed, 
            totalFailed: totalFilesFailed,
            batchStats: { success: successCount, failed: failCount, skipped: skippedCount }
        };
    }

    // Finalizar arquivo de log com estatísticas
    finalizeBatchLog(successCount, failCount, skippedCount, totalFilesProcessed, totalFilesFailed) {
        const summary = `
=== RESUMO FINAL ===
Data/Hora: ${new Date().toLocaleString('pt-BR')}
Batches bem-sucedidos: ${successCount}
Batches pulados: ${skippedCount}
Batches com falha: ${failCount}
Arquivos processados: ${totalFilesProcessed}
Arquivos com falha: ${totalFilesFailed}

=== FIM DO LOG ===
`;
        
        try {
            fs.appendFileSync(this.logFilePath, summary, 'utf8');
        } catch (error) {
            console.warn(`⚠️  Erro ao finalizar log: ${error.message}`);
        }
    }

    // Mostrar informações sem executar
    showInfo(pastasNames, enableResume = false) {
        const batches = this.createBatches(enableResume);
        console.log(`\n📊 INFORMAÇÕES DA DIVISÃO DAS PASTAS ${pastasNames}:`);
        console.log(`Total de arquivos pendentes: ${this.totalFiles}`);
        console.log(`Total de batches: ${batches.length}`);
        console.log(`Arquivos por batch: ${this.batchSize}`);
        if (batches.length > 0) {
            console.log(`Tempo estimado: ${Math.round(batches.length * 1)} minutos\n`);
        } else {
            console.log('🎉 Todos os arquivos já foram processados!\n');
        }
    }
}

// Execução
// Descobrir automaticamente todas as pastas do assets2
const tempDivider = new PastaDivider([], 200, false);
const allAssets2Folders = tempDivider.discoverAssets2Folders();

if (allAssets2Folders.length === 0) {
    console.error('❌ Nenhuma pasta encontrada em assets2/');
    process.exit(1);
}

const pastaPaths = allAssets2Folders;
const pastasNames = 'Todas as pastas do assets2';
const batchSize = 200; // 200 arquivos por commit (apenas PDFs agora)

console.log('📁 Pastas descobertas automaticamente:');
pastaPaths.forEach(pasta => console.log(`  - ${pasta}`));
console.log('');

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];

// Verificar se deve fazer push automaticamente
const autoPush = args.includes('--push') || args.includes('-p');

// Verificar se deve usar modo de resumo
const enableResume = args.includes('--resume') || args.includes('-r');

const divider = new PastaDivider(pastaPaths, batchSize, autoPush);

if (command === 'info') {
    divider.showInfo(pastasNames, enableResume);
} else if (command === 'info-resume' || (command === 'info' && enableResume)) {
    divider.showInfo(pastasNames, true);
} else if (command === 'run') {
    divider.run(pastasNames, enableResume);
} else if (command === 'run-resume' || (command === 'run' && enableResume)) {
    divider.run(pastasNames, true);
} else {
    console.log('📚 USO DO SCRIPT:');
    console.log('node scripts/dividirPasta.js info - Mostra informações dos batches (todos os arquivos)');
    console.log('node scripts/dividirPasta.js info-resume - Mostra informações apenas dos arquivos pendentes');
    console.log('node scripts/dividirPasta.js run  - Executa a divisão em commits (desde o início)');
    console.log('node scripts/dividirPasta.js run-resume - Continua de onde parou (recomendado)');
    console.log('node scripts/dividirPasta.js run --resume - Alternativa para continuar de onde parou');
    console.log('node scripts/dividirPasta.js run --push - Executa e faz push automaticamente');
    console.log('node scripts/dividirPasta.js run-resume --push - Continua e faz push automaticamente');
    console.log('\n📂 Pastas que serão processadas:');
    pastaPaths.forEach(pasta => console.log(`  - ${pasta}`));
    console.log(`\n📊 Configuração atual: ${batchSize} arquivos por commit (otimizado para PDFs)`);
    console.log('\n💡 DICA: Use sempre "run-resume" para continuar de onde parou em caso de interrupção!');
}
