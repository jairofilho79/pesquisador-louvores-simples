// Search Options Component Logic
class SearchOptionsComponent {
    constructor() {
        this.container = document.querySelector('.search-options-container');
        this.lastResults = []; // Armazenar últimos resultados para aplicar filtros
    }

    displayResults(results, applyFilters = true, customContainer = null) {
        // Usar container customizado se fornecido, senão usar o padrão
        const targetContainer = customContainer || this.container;
        
        // Armazenar resultados originais apenas se não é uma re-exibição de filtros
        if (applyFilters) {
            this.lastResults = results;
        }
        
        // NÃO APLICAR FILTROS NOS LOUVORES - sempre mostrar todos os resultados da busca
        // Os filtros serão aplicados no conteúdo de cada louvor individualmente
        
        this.clearResults(targetContainer);

        if (results.length === 0) {
            targetContainer.innerHTML = '<p style="text-align: center; color: #fff; font-size: 1.2rem;">Nenhum resultado encontrado</p>';
            return;
        }

        // Verificar se SearchOptionComponent está disponível
        if (!window.searchOptionComponent) {
            console.error('SearchOptionComponent não está disponível');
            targetContainer.innerHTML = '<p style="text-align: center; color: #fff; font-size: 1.2rem;">Erro: Componente não carregado</p>';
            return;
        }

        results.forEach(louvor => {
            const searchOptionElement = window.searchOptionComponent.createSearchOption(louvor);
            targetContainer.appendChild(searchOptionElement);
        });

        // Adicionar botões de playlist após exibir os resultados
        if (window.playlistManager) {
            // Aguardar o DOM ser atualizado
            setTimeout(() => {
                window.playlistManager.addPlaylistButtonsToResults();
            }, 100);
        }
    }

    clearResults(customContainer = null) {
        const targetContainer = customContainer || this.container;
        targetContainer.innerHTML = '';
        // NÃO limpar lastResults aqui - mantê-los para os filtros funcionarem
    }

    clearAll(customContainer = null) {
        const targetContainer = customContainer || this.container;
        targetContainer.innerHTML = '';
        this.lastResults = []; // Limpar tudo, incluindo resultados armazenados
    }
}

// Expor classe no window para verificação de carregamento
window.SearchOptionsComponent = SearchOptionsComponent;
