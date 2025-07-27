// Search Component Logic
class SearchComponent {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.searchClearBtn = document.getElementById('search-clear-btn');
        this.searchSubmitBtn = document.getElementById('search-submit-btn');
        this.searchText = '';

        this.init();
    }

    init() {
        this.searchInput.addEventListener('input', (e) => {
            this.searchText = e.target.value;
            this.updateSubmitButton();
        });

        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        this.searchClearBtn.addEventListener('click', () => {
            this.clearSearch();
        });

        this.searchSubmitBtn.addEventListener('click', () => {
            this.handleSearch();
        });

        this.updateSubmitButton();
        
        // Verificar modo inicial
        this.updateVisibility();
    }

    // Controlar visibilidade baseado no modo
    updateVisibility() {
        const isCodeMode = window.urlCodeManager && window.urlCodeManager.isCodeMode;
        const searchContainer = document.querySelector('.search-container');
        
        if (searchContainer) {
            const inputGroup = searchContainer.querySelector('.search-input-group');
            const buttonGroup = searchContainer.querySelector('.search-button-group');
            
            if (isCodeMode) {
                // Esconder input e botões no modo código
                if (inputGroup) inputGroup.style.display = 'none';
                if (buttonGroup) buttonGroup.style.display = 'none';
            } else {
                // Mostrar input e botões no modo pesquisa
                if (inputGroup) inputGroup.style.display = '';
                if (buttonGroup) buttonGroup.style.display = '';
            }
        }
    }

    get hasValue() {
        return this.searchText.trim().length > 0;
    }

    updateSubmitButton() {
        this.searchSubmitBtn.disabled = !this.hasValue;
    }

    clearSearch() {
        this.searchText = '';
        this.searchInput.value = '';
        this.updateSubmitButton();
        // Clear results - usar clearAll para limpar completamente
        searchOptionsComponent.clearAll();
        
        // Reset filtros se disponível
        if (window.filterComponent) {
            // Não resetar os filtros, apenas limpar resultados
            // Os filtros devem permanecer como estão
        }
    }

    handleSearch() {
        if (!this.hasValue) return;

        try {
            // Verificar se a aplicação está pronta
            if (!this.isApplicationReady()) {
                this.showNotReadyMessage();
                return;
            }

            console.log('[SearchComponent] Executando busca para:', this.searchText);
            const results = this.performSearch(this.searchText);
            console.log('[SearchComponent] Resultados encontrados:', results.length);
            
            // Usar window.searchOptionsComponent para garantir que existe
            if (window.searchOptionsComponent) {
                window.searchOptionsComponent.displayResults(results);
                console.log('[SearchComponent] Resultados exibidos com sucesso');
            } else {
                console.error('SearchOptionsComponent não está disponível');
                this.showNotReadyMessage();
            }
        } catch (error) {
            console.error('[SearchComponent] Erro durante a busca:', error);
            this.showErrorMessage('Erro na busca: ' + error.message);
        }
    }

    showErrorMessage(message) {
        const input = this.searchInput;
        const originalPlaceholder = input.placeholder;
        
        input.placeholder = message;
        input.style.backgroundColor = '#ffebee';
        input.style.borderColor = '#f44336';
        
        setTimeout(() => {
            input.placeholder = originalPlaceholder;
            input.style.backgroundColor = '';
            input.style.borderColor = '';
        }, 3000);
    }

    isApplicationReady() {
        return window.louvoresAssets2ComCodigos && 
               window.searchOptionsComponent && 
               window.searchOptionComponent;
    }

    showNotReadyMessage() {
        // Mostrar feedback visual que ainda está carregando
        const input = this.searchInput;
        const originalPlaceholder = input.placeholder;
        
        input.placeholder = 'Aguarde, ainda carregando...';
        input.style.backgroundColor = '#fff3cd';
        input.style.borderColor = '#ffeaa7';
        
        setTimeout(() => {
            input.placeholder = originalPlaceholder;
            input.style.backgroundColor = '';
            input.style.borderColor = '';
        }, 2000);

        console.log('Aplicação ainda não está pronta para busca');
    }

    performSearch(searchText) {
        // Usar diretamente os dados do assets2-louvores.js
        if (!window.louvoresAssets2ComCodigos) {
            console.error('Dados de louvores não carregados');
            return [];
        }

        const normalizedSearch = this.normalizeSearchString(searchText);
        const isNumericSearch = /^\d+$/.test(searchText.trim());

        // Primeiro filtrar apenas louvores de nível 2 (não subpastas)
        const louvoresNivel2 = window.louvoresAssets2ComCodigos.filter(item => {
            return this.isLouvorNivel2(item);
        });

        // Depois aplicar a busca nos louvores filtrados
        return louvoresNivel2.filter(louvor => {
            if (isNumericSearch) {
                return louvor.numero && louvor.numero.toString() === searchText.trim();
            } else {
                const normalizedName = this.normalizeSearchString(louvor.nome);
                return normalizedName.includes(normalizedSearch);
            }
        });
    }

    /**
     * Verifica se um item é um louvor de nível 2 (não uma subpasta)
     * Louvores de nível 2 têm características específicas:
     * - Têm caminho no padrão: assets2/[Categoria]/[Nome do Louvor]
     * - Não são subpastas de outros louvores
     */
    isLouvorNivel2(item) {
        if (!item.caminhoCompleto) return false;
        
        // Contar níveis no caminho (assets2 = nível 0)
        const pathParts = item.caminhoCompleto.split(/[\/\\]/).filter(part => part.length > 0);
        const nivel = pathParts.length - 1; // -1 porque assets2 é nível 0
        
        // Deve ser exatamente nível 2
        if (nivel !== 2) return false;
        
        // Verificar se segue padrões válidos de nomenclatura de louvor
        const nomePasta = pathParts[pathParts.length - 1]; // Último elemento do caminho
        return this.isNomeLouvorValido(nomePasta);
    }

    /**
     * Verifica se o nome da pasta segue os padrões válidos de louvor
     * PADRÕES VÁLIDOS:
     * - "001 - [P] Nome do Louvor" (3 dígitos + status no meio)
     * - "609 - [V] Nome Completo" (qualquer número + status no meio)
     * - "[P] Nome do Louvor" (apenas status no início, sem número)
     */
    isNomeLouvorValido(nomePasta) {
        const padroes = [
            /^\d+\s*-\s*\[.\]\s*.+/,            // Número - [Status] Nome (status no meio)
            /^\[.\]\s*.+/                       // [Status] Nome (apenas status no início)
        ];
        
        return padroes.some(padrao => padrao.test(nomePasta));
    }

    normalizeSearchString(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Método público para ser chamado quando o modo muda
    onModeChange() {
        this.updateVisibility();
    }
}

// Expor classe no window para verificação de carregamento
window.SearchComponent = SearchComponent;
