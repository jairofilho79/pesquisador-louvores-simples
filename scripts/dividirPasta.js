const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PastaDivider {
    constructor(pastaPaths, batchSize = 50, autoPush = false) {
        this.pastaPaths = Array.isArray(pastaPaths) ? pastaPaths : [pastaPaths];
        this.batchSize = batchSize;
        this.autoPush = autoPush;
        this.totalFiles = 0;
        this.processedFiles = 0;
    }

    // Obter todos os arquivos da pasta recursivamente
    getAllFiles(dirPath, arrayOfFiles = []) {
        try {
            const files = fs.readdirSync(dirPath);

            files.forEach(file => {
                const fullPath = path.join(dirPath, file);
                const relativePath = path.relative('.', fullPath);
                
                if (fs.statSync(fullPath).isDirectory()) {
                    arrayOfFiles = this.getAllFiles(fullPath, arrayOfFiles);
                } else {
                    arrayOfFiles.push(relativePath);
                }
            });
        } catch (error) {
            console.warn(`⚠️  Erro ao ler diretório ${dirPath}: ${error.message}`);
        }

        return arrayOfFiles;
    }

    // Criar batches de arquivos de todas as pastas
    createBatches() {
        const allFiles = [];
        
        // Coletar arquivos de todas as pastas
        this.pastaPaths.forEach(pastaPath => {
            const pastaFiles = this.getAllFiles(pastaPath);
            console.log(`📂 ${pastaPath}: ${pastaFiles.length} arquivos`);
            allFiles.push(...pastaFiles);
        });
        
        this.totalFiles = allFiles.length;
        const batches = [];
        
        console.log(`📊 Total de arquivos encontrados: ${this.totalFiles}`);
        
        // Dividir em batches
        for (let i = 0; i < allFiles.length; i += this.batchSize) {
            const batch = allFiles.slice(i, i + this.batchSize);
            batches.push(batch);
        }

        return batches;
    }

    // Executar um batch
    async executeBatch(batchFiles, batchNumber, totalBatches, pastasNames) {
        console.log(`\n🚀 Executando batch ${batchNumber}/${totalBatches} das pastas ${pastasNames}`);
        console.log(`📁 Arquivos neste batch: ${batchFiles.length}`);
        
        try {
            // Adicionar arquivos ao git um por um para evitar problemas de encoding
            console.log('📤 Adicionando arquivos ao git...');
            let addedCount = 0;
            
            for (const file of batchFiles) {
                try {
                    execSync(`git add "${file}"`, { stdio: 'pipe' });
                    addedCount++;
                } catch (error) {
                    console.warn(`⚠️  Erro ao adicionar ${file}: ${error.message}`);
                }
            }

            if (addedCount === 0) {
                console.log('⚠️  Nenhum arquivo foi adicionado. Pulando este batch.');
                return true;
            }

            // Fazer commit
            const commitMessage = `feat: adicionar batch ${batchNumber}/${totalBatches} das pastas ${pastasNames} (${addedCount} arquivos)`;
            console.log('💾 Fazendo commit...');
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });

            // Fazer push se autoPush estiver habilitado
            if (this.autoPush) {
                console.log('🚀 Fazendo push...');
                try {
                    execSync('git push origin main', { stdio: 'inherit' });
                    console.log('✅ Push realizado com sucesso!');
                } catch (pushError) {
                    console.warn(`⚠️  Erro no push: ${pushError.message}`);
                    console.log('📝 Continue manualmente com: git push origin main');
                }
            }

            this.processedFiles += addedCount;
            const progress = ((this.processedFiles / this.totalFiles) * 100).toFixed(1);
            console.log(`✅ Batch ${batchNumber} concluído! Progresso: ${progress}% (${this.processedFiles}/${this.totalFiles})`);

            return true;
        } catch (error) {
            console.error(`❌ Erro no batch ${batchNumber}:`, error.message);
            return false;
        }
    }

    // Executar todo o processo
    async run(pastasNames) {
        console.log(`🎯 Dividindo pastas ${pastasNames} em commits menores...\n`);
        
        const batches = this.createBatches();
        console.log(`\n📦 Total de batches criados: ${batches.length}`);
        console.log(`📊 Média de arquivos por batch: ${Math.round(this.totalFiles / batches.length)}`);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < batches.length; i++) {
            const batchNumber = i + 1;
            const success = await this.executeBatch(batches[i], batchNumber, batches.length, pastasNames);
            
            if (success) {
                successCount++;
            } else {
                failCount++;
                console.log(`\n❌ Falha no batch ${batchNumber}.`);
                break;
            }

            // Pequena pausa entre batches
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n🎉 Processo concluído!');
        console.log(`✅ Batches bem-sucedidos: ${successCount}`);
        console.log(`❌ Batches falharam: ${failCount}`);
        
        if (failCount === 0 && !this.autoPush) {
            console.log('\n🚀 Para enviar todos os commits para o GitHub, execute:');
            console.log('git push origin main');
        }
        
        return failCount === 0;
    }

    // Mostrar informações sem executar
    showInfo(pastasNames) {
        const batches = this.createBatches();
        console.log(`\n📊 INFORMAÇÕES DA DIVISÃO DAS PASTAS ${pastasNames}:`);
        console.log(`Total de arquivos: ${this.totalFiles}`);
        console.log(`Total de batches: ${batches.length}`);
        console.log(`Arquivos por batch: ${this.batchSize}`);
        console.log(`Tempo estimado: ${Math.round(batches.length * 1)} minutos\n`);
    }
}

// Execução
const pastaPaths = [
    'assets2/Louvores Coletânea de Partituras',
    'assets2/Repertório GLTM'
];
const pastasNames = 'Coletânea de Partituras + Repertório GLTM';
const batchSize = 50; // 50 arquivos por commit

// Verificar argumentos da linha de comando
const args = process.argv.slice(2);
const command = args[0];

// Verificar se deve fazer push automaticamente
const autoPush = args.includes('--push') || args.includes('-p');

const divider = new PastaDivider(pastaPaths, batchSize, autoPush);

if (command === 'info') {
    divider.showInfo(pastasNames);
} else if (command === 'run') {
    divider.run(pastasNames);
} else {
    console.log('📚 USO DO SCRIPT:');
    console.log('node scripts/dividirPasta.js info - Mostra informações dos batches');
    console.log('node scripts/dividirPasta.js run  - Executa a divisão em commits');
    console.log('node scripts/dividirPasta.js run --push - Executa e faz push automaticamente');
    console.log('\n📂 Pastas configuradas:');
    pastaPaths.forEach(pasta => console.log(`  - ${pasta}`));
}
