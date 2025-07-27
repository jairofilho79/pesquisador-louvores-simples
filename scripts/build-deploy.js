#!/usr/bin/env node

// Script de build para deploy - gera assets versionados
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para deploy...\n');

try {
    // 1. Gerar assets atualizados
    console.log('📂 Mapeando assets2...');
    execSync('node assetsFolderMapper.js', { 
        cwd: path.join(__dirname), 
        stdio: 'inherit' 
    });

    // 2. Ler informações de versão
    const versionPath = path.resolve(__dirname, '..', 'assets2-version.json');
    const versionInfo = JSON.parse(fs.readFileSync(versionPath, 'utf8'));

    console.log(`\n✅ Build concluído com sucesso!`);
    console.log(`📦 Versão: ${versionInfo.currentVersion}`);
    console.log(`📊 Total de louvores: ${versionInfo.totalLouvores}`);
    console.log(`🔗 URL versionada: assets2-louvores.js?v=${versionInfo.currentVersion}`);

    // 3. Gerar arquivo .htaccess para cache busting (Apache)
    const htaccessContent = `
# Cache busting para assets2-louvores.js
<FilesMatch "assets2-louvores\\.js">
    # Permitir cache apenas se tiver parâmetro de versão
    SetEnvIf Query_String "v=.+" HAS_VERSION
    Header set Cache-Control "public, max-age=31536000" env=HAS_VERSION
    Header set Cache-Control "no-cache, no-store, must-revalidate" env=!HAS_VERSION
</FilesMatch>

# Cache para assets2-version.json (sempre verificar)
<FilesMatch "assets2-version\\.json">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</FilesMatch>
`;

    const htaccessPath = path.resolve(__dirname, '..', '.htaccess');
    fs.writeFileSync(htaccessPath, htaccessContent.trim(), 'utf8');
    console.log(`📄 .htaccess atualizado para cache busting`);

    // 4. Criar arquivo de deploy info
    const deployInfo = {
        deployedAt: new Date().toISOString(),
        version: versionInfo.currentVersion,
        totalLouvores: versionInfo.totalLouvores,
        files: [
            'assets2-louvores.js',
            'assets2-version.json',
            'assets2-mapping.json'
        ]
    };

    const deployInfoPath = path.resolve(__dirname, '..', 'deploy-info.json');
    fs.writeFileSync(deployInfoPath, JSON.stringify(deployInfo, null, 2), 'utf8');

    console.log(`\n📋 Arquivos para deploy:`);
    deployInfo.files.forEach(file => {
        console.log(`   • ${file}`);
    });

    console.log(`\n🎯 Deploy pronto! Envie os arquivos atualizados para o servidor.`);

} catch (error) {
    console.error('❌ Erro durante o build:', error.message);
    process.exit(1);
}
