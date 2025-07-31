/**
 * TESTE DE DEPURAÇÃO - Pages Bar
 * Para verificar se a detecção de página atual está funcionando corretamente
 */

// Função para testar a detecção de página
function testPageDetection() {
    console.log('🧪 TESTE DE DETECÇÃO DE PÁGINA ATUAL');
    console.log('================================================');
    
    // Informações da URL atual
    console.log('📍 URL atual:', window.location.href);
    console.log('📁 Pathname:', window.location.pathname);
    console.log('📄 Arquivo:', window.location.pathname.split('/').pop() || 'index.html');
    
    // Testar detecção da instância Pages Bar
    if (window.pagesBar) {
        const detected = window.pagesBar.detectCurrentPageFromUrl();
        console.log('🎯 Página detectada pelo Pages Bar:', detected);
        console.log('📊 Estado atual do Pages Bar:', window.pagesBar.state.currentPage);
        
        // Verificar se há discrepância
        if (detected !== window.pagesBar.state.currentPage) {
            console.warn('⚠️ DISCREPÂNCIA ENCONTRADA!');
            console.warn('   Detectado:', detected);
            console.warn('   Estado atual:', window.pagesBar.state.currentPage);
            
            // Forçar atualização
            console.log('🔄 Forçando atualização...');
            window.pagesBar.validateAndSetCurrentPage();
        } else {
            console.log('✅ Detecção está correta!');
        }
    } else {
        console.error('❌ Pages Bar não está disponível');
    }
    
    // Verificar metadados carregados
    if (typeof window.getPagesBarData === 'function') {
        const data = window.getPagesBarData();
        console.log('📋 Páginas disponíveis:', data.pages.map(p => `${p.id} (${p.arquivo})`));
    }
    
    console.log('================================================');
}

// Auto-executar quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testPageDetection, 2000); // Aguardar 2s para inicialização
    });
} else {
    setTimeout(testPageDetection, 1000); // Aguardar 1s se já estiver carregado
}

// Disponibilizar globalmente para teste manual
window.testPageDetection = testPageDetection;

console.log('🔧 Teste de depuração carregado. Execute window.testPageDetection() para testar manualmente.');
