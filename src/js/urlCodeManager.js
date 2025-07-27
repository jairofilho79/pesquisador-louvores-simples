// URL Code Manager - Gerencia códigos únicos via URL
class URLCodeManager {
    constructor() {
        this.codes = [];
        this.playlistName = '';
        this.playlistTimestamp = '';
        this.isCodeMode = false;
        
        this.init();
    }

    init() {
        // Verificar se há códigos na URL ao carregar
        this.parseURLParams();
        
        // Escutar mudanças na URL
        window.addEventListener('popstate', () => {
            this.parseURLParams();
            this.applyCodeFilters();
        });
    }

    /**
     * Parse dos parâmetros da URL
     */
    parseURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Verificar códigos
        const codesParam = urlParams.get('codes');
        console.log('🔗 Parâmetro codes da URL:', codesParam);
        
        if (codesParam) {
            const rawCodes = codesParam.split(',').map(code => code.trim());
            console.log('📋 Códigos brutos:', rawCodes);
            
            this.codes = rawCodes.filter(code => {
                const upperCode = code.toUpperCase();
                const isValid = this.isValidCode(upperCode);
                if (!isValid) {
                    console.warn('⚠️ Código inválido ignorado:', code, '→', upperCode);
                    console.warn('  ✓ Formato esperado: XXX000 ou XXX000_slug');
                    console.warn('  ✗ Recebido:', code.length, 'caracteres:', code.split('').map(c => c.charCodeAt(0)));
                }
                return isValid;
            }).map(code => code.toUpperCase());
            
            this.isCodeMode = this.codes.length > 0;
            
            console.log('✅ Códigos válidos detectados na URL:', this.codes);
            console.log('🎯 Modo código ativado:', this.isCodeMode);
            
            // Aplicar filtros de código se em modo código
            if (this.isCodeMode) {
                this.applyCodeFilters();
            }
        } else {
            this.codes = [];
            this.isCodeMode = false;
            console.log('📝 Nenhum código na URL, modo pesquisa padrão');
            this.showSearchMode();
        }
        
        // Verificar nome da playlist
        const playlistParam = urlParams.get('playlist');
        if (playlistParam) {
            this.playlistName = decodeURIComponent(playlistParam);
            console.log('📝 Nome da playlist da URL:', this.playlistName);
        } else {
            this.playlistName = '';
        }
        
        // Verificar timestamp (apenas lê, não gera automaticamente)
        const timestampParam = urlParams.get('timestamp');
        if (timestampParam) {
            this.playlistTimestamp = decodeURIComponent(timestampParam);
            console.log('📅 Timestamp da playlist da URL:', this.playlistTimestamp);
        } else {
            this.playlistTimestamp = '';
        }
    }

    /**
     * Valida se um código tem o formato correto
     */
    isValidCode(code) {
        if (!code || typeof code !== 'string') return false;
        
        // Formato: XXX000 ou XXX000_slug (mínimo 6 chars)
        const codePattern = /^[A-Z]{3}\d{3}(_.*)?$/;
        const isValid = codePattern.test(code) && code.length >= 6;
        
        if (!isValid) {
            console.warn('❌ Código inválido:', code, 'não atende ao padrão XXX000');
        }
        
        return isValid;
    }

    /**
     * Busca louvores pelos códigos
     */
    getLouvoresByCodes() {
        if (!window.louvoresAssets2ComCodigos) {
            console.warn('⚠️ Dados de louvores ainda não carregados');
            return [];
        }
        
        const foundLouvores = [];
        const notFoundCodes = [];
        
        this.codes.forEach(code => {
            const louvor = window.louvoresAssets2ComCodigos.find(l => l.codigo === code);
            
            if (louvor) {
                foundLouvores.push(louvor);
                console.log('✅ Louvor encontrado para código', code + ':', louvor.nome);
            } else {
                notFoundCodes.push(code);
                console.warn('❌ Nenhum louvor encontrado para código:', code);
            }
        });
        
        if (notFoundCodes.length > 0) {
            console.warn('📋 Códigos não encontrados:', notFoundCodes);
            console.warn('💡 Certifique-se de que os códigos estão corretos e que os dados foram carregados');
        }
        
        console.log(`📊 Resultado da busca: ${foundLouvores.length}/${this.codes.length} códigos encontrados`);
        
        return foundLouvores;
    }

    /**
     * Aplica filtros baseados nos códigos da URL
     */
    async applyCodeFilters() {
        if (!this.isCodeMode) {
            console.log('📍 Não está em modo código, aplicando modo pesquisa');
            this.showSearchMode();
            return;
        }
        
        console.log('🔍 Aplicando filtros para códigos:', this.codes);
        
        // Aguardar dados carregarem
        if (!window.louvoresAssets2ComCodigos) {
            console.log('⏳ Aguardando dados serem carregados...');
            setTimeout(() => this.applyCodeFilters(), 500);
            return;
        }
        
        await this.showCodeMode();
    }

    /**
     * Mostra interface de pesquisa padrão
     */
    showSearchMode() {
        console.log('🔍 Mostrando modo pesquisa');
        
        // Mostrar container de pesquisa
        const searchContainer = document.querySelector('.search-options-container');
        if (searchContainer) {
            searchContainer.style.display = 'block';
        }
        
        // Mostrar input e filtros do modo pesquisa
        const searchComponent = document.getElementById('search');
        if (searchComponent) {
            searchComponent.style.display = 'block';
        }
        
        // Ocultar interface de código
        const codeInterface = document.querySelector('.code-mode-interface');
        if (codeInterface) {
            codeInterface.style.display = 'none';
        }
        
        // Limpar container de resultados de código
        const codeResults = document.getElementById('code-results-container');
        if (codeResults) {
            codeResults.innerHTML = '';
        }
    }

    /**
     * Mostra interface de modo código
     */
    async showCodeMode() {
        console.log('📋 Mostrando modo código');
        
        // Ocultar pesquisa e filtros do modo pesquisa
        const searchContainer = document.querySelector('.search-options-container');
        if (searchContainer) {
            searchContainer.style.display = 'none';
        }
        
        const searchComponent = document.getElementById('search');
        if (searchComponent) {
            searchComponent.style.display = 'none';
        }
        
        // Garantir que o container de código existe
        this.ensureCodeContainer();
        
        // Injetar interface de código
        this.injectCodeModeInterface();
        
        // Buscar e exibir resultados usando SearchOptionsComponent
        const louvores = this.getLouvoresByCodes();
        
        if (louvores.length > 0) {
            await this.displayCodeResultsUnified(louvores);
        } else {
            this.showNoResultsMessage();
        }
    }

    /**
     * Garante que o container de código existe
     */
    ensureCodeContainer() {
        let container = document.getElementById('code-results-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'code-results-container';
            container.className = 'code-results-container';
            
            const searchContainer = document.querySelector('.search-options-container');
            if (searchContainer && searchContainer.parentNode) {
                searchContainer.parentNode.insertBefore(container, searchContainer.nextSibling);
            } else {
                document.body.appendChild(container);
            }
            
            console.log('📦 Container de resultados de código criado');
        }
        return container;
    }

    /**
     * Injeta a interface do modo código
     */
    injectCodeModeInterface() {
        const container = document.getElementById('code-results-container');
        if (!container) return;
        
        console.log('📍 Injetando interface no container:', container);
        
        const interfaceHTML = `
            <div class="code-mode-interface code-mode-only" style="display: block; visibility: visible;">
                <div class="code-mode-header">
                    <div class="playlist-title-row">
                        <h2 class="playlist-title" style="color: var(--gold-color, #d4af37); margin: 0; margin-bottom: 8px;">${this.playlistName}</h2>
                    </div>
                    ${this.playlistTimestamp ? `
                    <div class="playlist-timestamp-row">
                        <h3 class="playlist-timestamp" style="color: var(--gold-color, #d4af37); margin: 0; font-size: 18px; font-weight: normal; opacity: 0.8;">${this.playlistTimestamp}</h3>
                    </div>
                    ` : ''}
                    <div class="code-mode-actions">
                        <button id="share-playlist-btn" class="share-btn">
                            <span>🔗</span> Compartilhar Lista
                        </button>
                        <a href="/pesquisador-louvores-simples/" class="back-to-search-btn">
                            <span>🔍</span> Voltar para Pesquisa
                        </a>
                    </div>
                </div>
                
                <div class="code-mode-results">
                    <div id="code-mode-filters-container" class="code-mode-filters">
                        <!-- Filtros serão injetados aqui -->
                    </div>
                    <div id="code-mode-items-container" class="search-options-container code-mode-items"></div>
                </div>
            </div>
        `;
        
        container.innerHTML = interfaceHTML;
        
        // Bind eventos
        this.bindCodeModeEvents();
        
        // Injetar filtros no modo código
        this.injectCodeModeFilters();
        
        console.log('✅ Interface do modo código injetada');
    }

    /**
     * Bind eventos da interface de código
     */
    bindCodeModeEvents() {
        const shareBtn = document.getElementById('share-playlist-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.sharePlaylist());
        }
    }

    /**
     * Injeta filtros no modo código
     */
    injectCodeModeFilters() {
        const filtersContainer = document.getElementById('code-mode-filters-container');
        if (!filtersContainer) return;
        
        // Verificar se FilterComponent está disponível
        if (!window.filterComponent) {
            console.warn('FilterComponent não está disponível para o modo código');
            return;
        }
        
        // Criar HTML dos filtros para o modo código com classes CSS corretas
        const filtersHTML = `
            <div class="filter-section content-filter-desktop">
                <span class="filter-section-title">
                    Conteúdo:
                    <span class="filter-info-icon" title="Selecione os tipos de conteúdo que deseja ver nos resultados">ⓘ</span>
                </span>
                <div class="filter-checkbox-group">
                    <label class="filter-checkbox-item">
                        <input type="checkbox" id="code-filter-todos" checked />
                        <span>Todos</span>
                    </label>
                    <label class="filter-checkbox-item">
                        <input type="checkbox" id="code-filter-coro" checked />
                        <span>Coro</span>
                    </label>
                    <label class="filter-checkbox-item">
                        <input type="checkbox" id="code-filter-grade" checked />
                        <span>Grade</span>
                    </label>
                    <label class="filter-checkbox-item">
                        <input type="checkbox" id="code-filter-sopros" checked />
                        <span>Sopros</span>
                    </label>
                    <label class="filter-checkbox-item">
                        <input type="checkbox" id="code-filter-cordas" checked />
                        <span>Cordas</span>
                    </label>
                </div>
            </div>
        `;
        
        filtersContainer.innerHTML = filtersHTML;
        
        // Conectar eventos dos filtros do modo código aos filtros originais
        this.bindCodeModeFilters();
        
        console.log('✅ Filtros do modo código injetados');
    }

    /**
     * Conecta filtros do modo código aos filtros originais
     */
    bindCodeModeFilters() {
        // Mapear checkboxes do modo código para os originais
        const filterMapping = {
            'code-filter-todos': 'filter-todos',
            'code-filter-coro': 'filter-coro',
            'code-filter-grade': 'filter-grade', 
            'code-filter-sopros': 'filter-sopros',
            'code-filter-cordas': 'filter-cordas'
        };
        
        Object.entries(filterMapping).forEach(([codeId, originalId]) => {
            const codeCheckbox = document.getElementById(codeId);
            const originalCheckbox = document.getElementById(originalId);
            
            if (codeCheckbox && originalCheckbox) {
                // Sincronizar estado inicial
                codeCheckbox.checked = originalCheckbox.checked;
                
                // Sincronizar mudanças do modo código para o original
                codeCheckbox.addEventListener('change', () => {
                    originalCheckbox.checked = codeCheckbox.checked;
                    originalCheckbox.dispatchEvent(new Event('change'));
                });
            }
        });
    }

    /**
     * Exibe os resultados dos códigos usando SearchOptionsComponent (UNIFICADO)
     */
    async displayCodeResultsUnified(louvores) {
        const container = document.getElementById('code-mode-items-container');
        if (!container) {
            console.error('❌ Container code-mode-items-container não encontrado');
            return;
        }
        
        console.log('📊 Exibindo', louvores.length, 'louvores encontrados (modo unificado)');
        
        // Aguardar componentes estarem prontos
        await this.waitForComponents();
        
        // Verificar se SearchOptionsComponent está disponível
        if (!window.searchOptionsComponent) {
            console.error('❌ SearchOptionsComponent não está disponível');
            
            // Tentar criar uma instância se a classe estiver disponível
            if (window.SearchOptionsComponent) {
                console.log('🔧 Criando instância de SearchOptionsComponent...');
                window.searchOptionsComponent = new window.SearchOptionsComponent();
                console.log('✅ Instância criada com sucesso');
            } else {
                console.error('❌ Classe SearchOptionsComponent não encontrada');
                this.displayCodeResultsFallback(louvores);
                return;
            }
        }
        
        // Usar SearchOptionsComponent com container customizado
        window.searchOptionsComponent.displayResults(louvores, false, container);
        
        console.log('✅ Resultados exibidos usando SearchOptionsComponent');
    }

    /**
     * Aguarda componentes estarem prontos
     */
    waitForComponents() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 30;

            const check = () => {
                attempts++;
                
                const ready = window.SearchOptionsComponent && 
                            window.SearchOptionComponent;

                if (ready) {
                    console.log('✅ Componentes prontos após', attempts, 'tentativas');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.warn('⚠️ Timeout aguardando componentes após', attempts, 'tentativas');
                    resolve(); // Continue mesmo se não estiver pronto
                } else {
                    setTimeout(check, 100);
                }
            };

            check();
        });
    }

    /**
     * Exibe os resultados dos códigos (FALLBACK - versão original)
     */
    displayCodeResultsFallback(louvores) {
        const container = document.getElementById('code-mode-items-container');
        if (!container) return;
        
        console.log('⚠️ Usando fallback para exibir', louvores.length, 'louvores');
        
        const resultHTML = louvores.map(louvor => `
            <div class="master-file-section" data-louvor-codigo="${louvor.codigo}">
                <div class="louvor-card-content">
                    <div class="louvor-info">
                        <h3 class="louvor-nome" data-field="nome">${louvor.nome}</h3>
                        <div class="louvor-details">
                            <span class="louvor-numero" data-field="numero">${louvor.numero || ''}</span>
                            <span class="louvor-categoria" data-field="categoria">${louvor.categoria || ''}</span>
                            <span class="louvor-codigo-display">Código: ${louvor.codigo}</span>
                        </div>
                    </div>
                    <div class="louvor-actions">
                        <a href="${louvor.arquivo}" target="_blank" class="view-pdf-btn">
                            📄 Ver PDF
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = resultHTML;
        
        console.log('✅ Resultados exibidos usando fallback');
    }

    /**
     * Exibe os resultados dos códigos (ORIGINAL - manter para referência)
     */
    displayCodeResultsOriginal(louvores) {
        const container = document.getElementById('code-mode-items-container');
        if (!container) return;
        
        console.log('📊 Exibindo', louvores.length, 'louvores encontrados');
        
        const resultHTML = louvores.map(louvor => `
            <div class="master-file-section" data-louvor-codigo="${louvor.codigo}">
                <div class="louvor-card-content">
                    <div class="louvor-info">
                        <h3 class="louvor-nome" data-field="nome">${louvor.nome}</h3>
                        <div class="louvor-details">
                            <span class="louvor-numero" data-field="numero">${louvor.numero || ''}</span>
                            <span class="louvor-categoria" data-field="categoria">${louvor.categoria || ''}</span>
                            <span class="louvor-codigo-display">Código: ${louvor.codigo}</span>
                        </div>
                    </div>
                    <div class="louvor-actions">
                        <a href="${louvor.arquivo}" target="_blank" class="view-pdf-btn">
                            📄 Ver PDF
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = resultHTML;
        
        console.log('✅ Resultados exibidos no DOM');
    }

    /**
     * Mostra mensagem quando não há resultados
     */
    showNoResultsMessage() {
        const container = document.getElementById('code-mode-items-container');
        if (!container) return;
        
        // Limpar container primeiro
        container.innerHTML = '';
        
        const noResultsHTML = `
            <div class="no-results-message">
                <h3>😕 Nenhum louvor encontrado</h3>
                <p>Os códigos fornecidos não correspondem a nenhum louvor na base de dados.</p>
                <div class="invalid-codes">
                    <strong>Códigos pesquisados:</strong> ${this.codes.join(', ')}
                </div>
                <p class="suggestion">
                    💡 Verifique se os códigos estão corretos ou tente uma <a href="/">pesquisa normal</a>.
                </p>
            </div>
        `;
        
        container.innerHTML = noResultsHTML;
        
        console.log('❌ Mensagem de "nenhum resultado" exibida');
    }

    /**
     * Compartilha a playlist atual
     */
    sharePlaylist() {
        if (this.codes.length === 0) {
            alert('Nenhum código para compartilhar');
            return;
        }
        
        const name = this.playlistName || 'Lista Rápida';
        
        // Gerar timestamp no momento do compartilhamento
        const now = new Date();
        const date = now.toLocaleDateString('pt-BR');
        const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const timestamp = `${date} ${time}`;
        
        const codes = this.codes.join(',');
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?codes=${codes}&playlist=${encodeURIComponent(name)}&timestamp=${encodeURIComponent(timestamp)}`;
        
        console.log('🔗 Compartilhando playlist:', { name, timestamp, codes: this.codes });
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showShareFeedback('Link copiado para a área de transferência!');
            }).catch(err => {
                console.error('Erro ao copiar para clipboard:', err);
                this.showShareUrlDialog(shareUrl);
            });
        } else {
            this.showShareUrlDialog(shareUrl);
        }
    }

    /**
     * Mostra feedback de compartilhamento
     */
    showShareFeedback(message) {
        // Remover feedback anterior se existir
        const existingFeedback = document.querySelector('.share-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }
        
        const feedback = document.createElement('div');
        feedback.className = 'share-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--gold-color, #d4af37);
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 500;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        // Animar entrada
        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateX(0)';
        }, 100);
        
        // Remover após delay
        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    /**
     * Mostra dialog com URL para copiar manualmente
     */
    showShareUrlDialog(url) {
        prompt('Copie o link da playlist:', url);
    }

    /**
     * Adiciona um código à lista
     */
    addCode(code) {
        const upperCode = code.toUpperCase();
        if (this.isValidCode(upperCode) && !this.codes.includes(upperCode)) {
            this.codes.push(upperCode);
            this.isCodeMode = true;
            this.updateURL();
            this.applyCodeFilters();
            console.log('➕ Código adicionado:', upperCode);
        }
    }

    /**
     * Remove um código da lista
     */
    removeCode(code) {
        const upperCode = code.toUpperCase();
        const index = this.codes.indexOf(upperCode);
        if (index > -1) {
            this.codes.splice(index, 1);
            this.isCodeMode = this.codes.length > 0;
            this.updateURL();
            
            if (this.isCodeMode) {
                this.applyCodeFilters();
            } else {
                this.showSearchMode();
            }
            
            console.log('➖ Código removido:', upperCode);
        }
    }

    /**
     * Atualiza a URL com códigos atuais
     */
    updateURL() {
        const url = new URL(window.location);
        
        if (this.codes.length > 0) {
            url.searchParams.set('codes', this.codes.join(','));
            
            if (this.playlistName) {
                url.searchParams.set('playlist', this.playlistName);
            }
            if (this.playlistTimestamp) {
                url.searchParams.set('timestamp', this.playlistTimestamp);
            }
        } else {
            url.searchParams.delete('codes');
            url.searchParams.delete('playlist');
            url.searchParams.delete('timestamp');
        }
        
        window.history.pushState({}, '', url);
    }

    // Métodos utilitários públicos
    getCodes() { return [...this.codes]; }
    getPlaylistName() { return this.playlistName; }
    getPlaylistTimestamp() { return this.playlistTimestamp; }
    getCodeMode() { return this.isCodeMode; }
    getCodesCount() { return this.codes.length; }
}

// Criar instância global
window.urlCodeManager = null;

// Função de inicialização
function initializeURLCodeManager() {
    if (!window.urlCodeManager) {
        window.urlCodeManager = new URLCodeManager();
        console.log('✅ URLCodeManager inicializado');
    }
    return window.urlCodeManager;
}

// Exportar para uso
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { URLCodeManager, initializeURLCodeManager };
}
