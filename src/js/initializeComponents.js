// Initialize components
const searchComponent = new SearchComponent();
const searchOptionsComponent = new SearchOptionsComponent();
const searchOptionComponent = new SearchOptionComponent();

// Initialize filters immediately after other components
console.log('Inicializando FilterComponent...');
try {
    window.filterComponent = new FilterComponent();
    console.log('FilterComponent inicializado com sucesso');
} catch (error) {
    console.error('Erro ao inicializar FilterComponent:', error);
    
    // Tentar novamente após um pequeno delay
    setTimeout(() => {
        try {
            if (!window.filterComponent) {
                window.filterComponent = new FilterComponent();
                console.log('FilterComponent inicializado com sucesso (segunda tentativa)');
            }
        } catch (error2) {
            console.error('Erro na segunda tentativa de inicializar FilterComponent:', error2);
        }
    }, 500);
}

// Initialize URL Code Manager
console.log('Inicializando URLCodeManager...');
try {
    if (typeof URLCodeManager !== 'undefined') {
        window.urlCodeManager = new URLCodeManager();
        console.log('URLCodeManager inicializado com sucesso');
        
        // Aplicar filtros de código se necessário
        window.urlCodeManager.applyCodeFilters();
    } else {
        console.warn('URLCodeManager não encontrado - funcionalidade de códigos não disponível');
    }
} catch (error) {
    console.error('Erro ao inicializar URLCodeManager:', error);
}

// Initialize Playlist Manager  
console.log('Inicializando PlaylistManager...');
try {
    if (typeof PlaylistManager !== 'undefined') {
        // Verificar se já existe uma instância global
        if (!window.playlistManager) {
            window.playlistManager = new PlaylistManager();
            console.log('PlaylistManager inicializado com sucesso');
        } else {
            console.log('PlaylistManager já existe, reutilizando instância:', window.playlistManager.instanceId);
        }
        
        // Forçar sincronização se URL manager já estiver pronto
        setTimeout(() => {
            if (window.urlCodeManager && window.urlCodeManager.getCodeMode()) {
                console.log('🔄 Forçando sincronização URL → Playlist...');
                window.playlistManager.syncWithURLManager();
            }
        }, 100);
    } else {
        console.warn('PlaylistManager não encontrado - funcionalidade de playlist não disponível');
    }
} catch (error) {
    console.error('Erro ao inicializar PlaylistManager:', error);
}

// Make search functionality available globally (for compatibility with main.js)
window.searchComponent = searchComponent;
window.searchOptionsComponent = searchOptionsComponent;
window.searchOptionComponent = searchOptionComponent;
