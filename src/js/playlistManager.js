// Playlist Manager - Gerencia adição/remoção de louvores em playlists
class PlaylistManager {
    constructor() {
        // Verificar se já existe uma instância global ativa
        if (typeof window !== 'undefined' && window.playlistManager && window.playlistManager !== this) {
            console.log('⚠️ Tentativa de criar nova instância quando já existe uma global. Retornando instância existente.');
            return window.playlistManager;
        }
        
        this.currentPlaylist = [];
        this.playlistName = '';
        this.playlistTimestamp = null;
        this.isVisible = false;
        this.instanceId = Math.random().toString(36).substr(2, 9);
        
        console.log('🏗️ PlaylistManager criado - ID:', this.instanceId);
        
        this.init();
    }

    init() {
        this.injectPlaylistInterface();
        this.bindEvents();
        
        // Sincronizar com URLCodeManager se existir (após interface criada)
        if (window.urlCodeManager) {
            this.syncWithURLManager();
        }
        
        // Observar mudanças no DOM para adicionar botões dinamicamente
        this.observeResultsContainer();
        
        // Adicionar botões aos resultados existentes
        setTimeout(() => this.addPlaylistButtonsToResults(), 100);
        
        // Verificar novamente a sincronização após um delay (caso URL manager não estivesse pronto)
        setTimeout(() => {
            if (window.urlCodeManager && window.urlCodeManager.getCodeMode() && this.currentPlaylist.length === 0) {
                console.log('🔄 Tentando sincronizar novamente...');
                this.syncWithURLManager();
            }
        }, 500);
    }

    /**
     * Sincroniza com o URLCodeManager
     */
    syncWithURLManager() {
        if (window.urlCodeManager && window.urlCodeManager.getCodeMode()) {
            console.log('🔗 Sincronizando playlist com códigos da URL...');
            
            // Obter códigos da URL
            const urlCodes = window.urlCodeManager.getCodes();
            const urlPlaylistName = window.urlCodeManager.getPlaylistName();
            const urlPlaylistTimestamp = window.urlCodeManager.getPlaylistTimestamp();
            
            // Atualizar estado local
            this.currentPlaylist = [...urlCodes];
            this.playlistName = urlPlaylistName;
            this.playlistTimestamp = urlPlaylistTimestamp;
            
            // Atualizar interface
            this.updateInterface();
            
            // Aguardar DOM estar pronto e depois atualizar botões
            setTimeout(() => {
                this.updateAddButtons();
                console.log(`✅ Sincronizado: ${this.currentPlaylist.length} códigos`);
            }, 100);
        }
    }

    injectPlaylistInterface() {
        const header = document.querySelector('header') || document.querySelector('body');
        if (!header || document.querySelector('.playlist-manager')) return;

        // SEMPRE mostrar interface de playlist (removida condição do modo code)
        const interfaceHTML = `
            <div class="playlist-manager">
                <div class="playlist-toggle">
                    <button id="playlist-toggle-btn" class="playlist-toggle-btn">
                        📋 <span class="playlist-count">0</span>
                    </button>
                </div>
                <div class="playlist-panel" id="playlist-panel">
                    <div class="playlist-header">
                        <h3>📋 Minha Lista</h3>
                        <button id="playlist-close-btn" class="playlist-close-btn">×</button>
                    </div>
                    <div class="playlist-content">
                        <div class="playlist-name-input">
                            <input type="text" id="playlist-name" placeholder="Nome da lista..." maxlength="50">
                        </div>
                        <div class="playlist-items" id="playlist-items">
                            <div class="empty-playlist">
                                <p>Nenhum louvor adicionado ainda</p>
                                <p class="hint">Use os botões "+" nos resultados de pesquisa</p>
                            </div>
                        </div>
                        <div class="playlist-actions">
                            <button id="playlist-share-btn" class="playlist-action-btn share" disabled>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                </svg>
                                Compartilhar
                            </button>
                            <button id="playlist-clear-btn" class="playlist-action-btn clear" disabled>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        header.insertAdjacentHTML('beforeend', interfaceHTML);
    }

    /**
     * Bind eventos da interface
     */
    bindEvents() {
        console.log(`🔧 [${this.instanceId}] Configurando eventos`);
        
        const toggleBtn = document.getElementById('playlist-toggle-btn');
        const closeBtn = document.getElementById('playlist-close-btn');
        const panel = document.getElementById('playlist-panel');
        const nameInput = document.getElementById('playlist-name');
        const shareBtn = document.getElementById('playlist-share-btn');
        const clearBtn = document.getElementById('playlist-clear-btn');

        console.log(`🔍 [${this.instanceId}] Elementos encontrados:`, {
            toggleBtn: !!toggleBtn,
            closeBtn: !!closeBtn,
            panel: !!panel,
            nameInput: !!nameInput,
            shareBtn: !!shareBtn,
            clearBtn: !!clearBtn
        });

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.togglePanel());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hidePanel());
        }

        if (panel) {
            panel.addEventListener('click', (e) => e.stopPropagation());
            document.addEventListener('click', (e) => {
                if (!panel.contains(e.target) && !toggleBtn?.contains(e.target)) {
                    this.hidePanel();
                }
            });
        }

        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                this.playlistName = e.target.value;
            });
        }

        if (shareBtn) {
            console.log(`🔗 [${this.instanceId}] Configurando evento de compartilhar`);
            
            // Remover listeners anteriores se existirem
            const existingHandler = shareBtn.getAttribute('data-playlist-handler');
            if (existingHandler) {
                console.log(`🔄 [${this.instanceId}] Removendo handler anterior:`, existingHandler);
            }
            
            // Marcar este handler
            shareBtn.setAttribute('data-playlist-handler', this.instanceId);
            
            shareBtn.addEventListener('click', () => {
                console.log(`🔗 [${this.instanceId}] Botão compartilhar clicado`);
                this.sharePlaylist();
            });
        } else {
            console.warn(`⚠️ [${this.instanceId}] Botão compartilhar não encontrado`);
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearPlaylist());
        }
    }

    /**
     * Limpar playlist com sistema de desfazer
     */
    clearPlaylist() {
        if (this.currentPlaylist.length === 0) return;

        // Salvar estado para desfazer
        const backupPlaylist = [...this.currentPlaylist];
        const backupName = this.playlistName;
        const backupTimestamp = this.playlistTimestamp;
        
        // Limpar imediatamente
        this.currentPlaylist = [];
        this.updateInterface();
        this.updateAddButtons();
        
        // Mostrar botão de desfazer com countdown
        this.showUndoButton(backupPlaylist, backupName, backupTimestamp);
    }

    /**
     * Mostra botão de desfazer com countdown de 7 segundos
     */
    showUndoButton(backupPlaylist, backupName, backupTimestamp) {
        const clearBtn = document.getElementById('playlist-clear-btn');
        if (!clearBtn) return;

        let countdown = 7;
        
        // Remover listener atual
        const newClearBtn = clearBtn.cloneNode(true);
        clearBtn.parentNode.replaceChild(newClearBtn, clearBtn);
        
        // Configurar botão de desfazer
        const updateUndoButton = () => {
            newClearBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
                </svg>
                Desfazer (${countdown}s)
            `;
            newClearBtn.className = 'playlist-action-btn undo';
            newClearBtn.disabled = false;
        };

        updateUndoButton();

        // Listener de desfazer
        const undoHandler = () => {
            clearInterval(countdownInterval);
            this.currentPlaylist = backupPlaylist;
            this.playlistName = backupName;
            this.playlistTimestamp = backupTimestamp;
            this.updateInterface();
            this.updateAddButtons();
            this.restoreClearButton();
            this.showFeedback('Ação desfeita');
        };

        newClearBtn.addEventListener('click', undoHandler);

        // Countdown
        const countdownInterval = setInterval(() => {
            countdown--;
            updateUndoButton();
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                this.restoreClearButton();
                this.showFeedback('Lista limpa definitivamente');
            }
        }, 1000);
    }

    /**
     * Restaura o botão de limpar original
     */
    restoreClearButton() {
        const undoBtn = document.getElementById('playlist-clear-btn');
        if (!undoBtn) return;

        // Remover listener de desfazer
        const newClearBtn = undoBtn.cloneNode(false);
        newClearBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px;">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            Limpar
        `;
        newClearBtn.className = 'playlist-action-btn clear';
        newClearBtn.disabled = this.currentPlaylist.length === 0;
        
        undoBtn.parentNode.replaceChild(newClearBtn, undoBtn);
        
        // Reativar listener original
        newClearBtn.addEventListener('click', () => this.clearPlaylist());
    }

    updateInterface() {
        const countElement = document.querySelector('.playlist-count');
        const itemsContainer = document.getElementById('playlist-items');
        const nameInput = document.getElementById('playlist-name');
        const shareBtn = document.getElementById('playlist-share-btn');
        const clearBtn = document.getElementById('playlist-clear-btn');

        if (countElement) {
            countElement.textContent = this.currentPlaylist.length;
        }

        const hasItems = this.currentPlaylist.length > 0;

        if (shareBtn) shareBtn.disabled = !hasItems;
        if (clearBtn) clearBtn.disabled = !hasItems;

        if (nameInput && this.playlistName) {
            nameInput.value = this.playlistName;
        }

        if (itemsContainer) {
            if (hasItems) {
                this.displayPlaylistItems(itemsContainer);
            } else {
                itemsContainer.innerHTML = `
                    <div class="empty-playlist">
                        <p>Nenhum louvor adicionado ainda</p>
                        <p class="hint">Use os botões "+" nos resultados de pesquisa</p>
                    </div>
                `;
            }
        }
    }

    displayPlaylistItems(container) {
        if (!window.louvoresAssets2ComCodigos) {
            container.innerHTML = '<p>Dados não carregados</p>';
            return;
        }

        const itemsHTML = this.currentPlaylist.map(codigo => {
            const louvor = window.louvoresAssets2ComCodigos.find(l => l.codigo === codigo);
            const nome = louvor ? louvor.nome : `Código: ${codigo}`;
            const numero = louvor ? louvor.numero || '' : '';
            const categoria = louvor ? louvor.categoria || '' : '';

            return `
                <div class="playlist-item" data-codigo="${codigo}">
                    <div class="playlist-item-info">
                        <span class="playlist-item-nome">${nome}</span>
                        ${numero ? `<span class="playlist-item-numero">#${numero}</span>` : ''}
                        ${categoria ? `<span class="playlist-item-categoria">${categoria}</span>` : ''}
                    </div>
                    <button class="playlist-item-remove" data-codigo="${codigo}" title="Remover">×</button>
                </div>
            `;
        }).join('');

        container.innerHTML = itemsHTML;

        // Adicionar listeners para remoção
        container.querySelectorAll('.playlist-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const codigo = btn.dataset.codigo;
                this.removeLouvor(codigo);
            });
        });
    }

    addLouvor(codigo) {
        console.log('➕ addLouvor chamado para código:', codigo);
        console.log('📋 Estado antes:', { length: this.currentPlaylist.length, items: [...this.currentPlaylist] });
        
        if (!this.hasLouvor(codigo)) {
            this.currentPlaylist.push(codigo);
            console.log('✅ Código adicionado. Estado depois:', { length: this.currentPlaylist.length, items: [...this.currentPlaylist] });
            
            this.updateInterface();
            this.updateAddButtons();
            
            if (!this.playlistName) {
                this.playlistName = this.generateDefaultName();
                console.log('📝 Nome gerado:', this.playlistName);
                this.updateInterface();
            }
        } else {
            console.log('⚠️ Código já está na lista');
        }
    }

    removeLouvor(codigo) {
        console.log('➖ removeLouvor chamado para código:', codigo);
        console.log('📋 Estado antes:', { length: this.currentPlaylist.length, items: [...this.currentPlaylist] });
        
        const index = this.currentPlaylist.indexOf(codigo);
        if (index > -1) {
            this.currentPlaylist.splice(index, 1);
            console.log('✅ Código removido. Estado depois:', { length: this.currentPlaylist.length, items: [...this.currentPlaylist] });
            
            this.updateInterface();
            this.updateAddButtons();
        } else {
            console.log('⚠️ Código não encontrado na lista');
        }
    }

    hasLouvor(codigo) {
        return this.currentPlaylist.includes(codigo);
    }

    updateAddButtons() {
        const buttons = document.querySelectorAll('.add-to-playlist-btn');
        buttons.forEach(btn => {
            const codigo = btn.dataset.codigo;
            const isInPlaylist = this.hasLouvor(codigo);
            
            if (isInPlaylist) {
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                        <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                `;
            } else {
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                `;
            }
            
            btn.title = isInPlaylist ? 'Remover da lista' : 'Adicionar à lista';
            btn.classList.toggle('added', isInPlaylist);
        });
    }

    togglePanel() {
        if (this.isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    showPanel() {
        const panel = document.getElementById('playlist-panel');
        if (panel) {
            panel.style.display = 'block';
            setTimeout(() => panel.classList.add('show'), 10);
            this.isVisible = true;
        }
    }

    hidePanel() {
        const panel = document.getElementById('playlist-panel');
        if (panel) {
            panel.classList.remove('show');
            setTimeout(() => panel.style.display = 'none', 300);
            this.isVisible = false;
        }
    }

    sharePlaylist() {
        console.log(`🔗 [${this.instanceId}] sharePlaylist() chamado`);
        console.log(`📋 [${this.instanceId}] Estado atual da playlist:`, {
            length: this.currentPlaylist.length,
            items: this.currentPlaylist,
            playlistName: this.playlistName,
            isVisible: this.isVisible
        });
        
        if (this.currentPlaylist.length === 0) {
            console.error(`❌ [${this.instanceId}] Lista vazia detectada no sharePlaylist`);
            alert('Adicione louvores à lista primeiro');
            return;
        }

        console.log(`✅ [${this.instanceId}] Lista não está vazia, prosseguindo com compartilhamento`);
        
        const name = this.playlistName || this.generateDefaultName();
        const timestamp = this.generateTimestamp(); // Gerar timestamp no momento do compartilhamento
        const codes = this.currentPlaylist.join(',');
        const baseUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${baseUrl}?codes=${codes}&playlist=${encodeURIComponent(name)}&timestamp=${encodeURIComponent(timestamp)}`;

        navigator.clipboard.writeText(shareUrl).then(() => {
            this.showFeedback('Link copiado para a área de transferência!');
        }).catch(() => {
            prompt('Copie o link:', shareUrl);
        });
    }

    generateDefaultName() {
        return 'Lista Rápida';
    }

    generateTimestamp() {
        const now = new Date();
        const date = now.toLocaleDateString('pt-BR');
        const time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `${date} ${time}`;
    }

    showFeedback(message) {
        const existing = document.querySelector('.playlist-feedback');
        if (existing) existing.remove();

        const feedback = document.createElement('div');
        feedback.className = 'playlist-feedback';
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

        setTimeout(() => {
            feedback.style.opacity = '1';
            feedback.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            feedback.style.opacity = '0';
            feedback.style.transform = 'translateX(100%)';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    observeResultsContainer() {
        const container = document.querySelector('.search-options-container');
        if (!container) return;

        const observer = new MutationObserver(() => {
            setTimeout(() => this.addPlaylistButtonsToResults(), 100);
        });

        observer.observe(container, {
            childList: true,
            subtree: true
        });
    }

    addPlaylistButtonsToResults() {
        const louvorCards = document.querySelectorAll('.search-option-louvor-card, .master-file-section');
        
        louvorCards.forEach(card => {
            if (card.querySelector('.add-to-playlist-btn')) {
                return;
            }
            
            const louvorData = this.extractLouvorDataFromElement(card);
            if (louvorData && louvorData.codigo) {
                this.addPlaylistButtonToElement(card, louvorData);
            }
        });
    }

    extractLouvorDataFromElement(element) {
        try {
            const card = element.classList.contains('search-option-louvor-card') || 
                        element.classList.contains('master-file-section') ? 
                        element : 
                        element.querySelector('.search-option-louvor-card') || 
                        element.querySelector('.master-file-section');
            
            if (!card) return null;
            
            const nomeElement = card.querySelector('[data-field="nome"]');
            const nome = nomeElement ? nomeElement.textContent.trim() : '';
            
            const numeroElement = card.querySelector('[data-field="numero"]');
            const numero = numeroElement ? numeroElement.textContent.trim() : '';
            
            const categoriaElement = card.querySelector('[data-field="categoria"]');
            const categoria = categoriaElement ? categoriaElement.textContent.trim() : '';
            
            const colecaoElement = card.querySelector('[data-field="colecao"]');
            const colecao = colecaoElement ? colecaoElement.textContent.trim() : '';
            
            if (nome) {
                // PRIMEIRO: Tentar usar o código real do louvor se disponível
                const codigoReal = card.getAttribute('data-louvor-codigo');
                if (codigoReal) {
                    return {
                        codigo: codigoReal,
                        nome: nome,
                        numero: numero,
                        categoria: categoria || colecao,
                        colecao: colecao
                    };
                }
                
                // FALLBACK: Tentar buscar nos dados carregados
                if (window.louvoresAssets2ComCodigos) {
                    const louvorEncontrado = window.louvoresAssets2ComCodigos.find(l => 
                        l.nome === nome && 
                        String(l.numero) === String(numero) && 
                        (l.categoria === categoria || l.categoria === colecao)
                    );
                    
                    if (louvorEncontrado) {
                        return {
                            codigo: louvorEncontrado.codigo,
                            nome: nome,
                            numero: numero,
                            categoria: categoria || colecao,
                            colecao: colecao
                        };
                    }
                }
                
                console.warn('⚠️ Louvor não encontrado nos dados:', nome, numero, categoria);
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao extrair dados do louvor:', error);
            return null;
        }
    }

    addPlaylistButtonToElement(element, louvorData) {
        const button = document.createElement('button');
        button.className = 'add-to-playlist-btn';
        button.dataset.codigo = louvorData.codigo;
        
        const isInPlaylist = this.hasLouvor(louvorData.codigo);
        
        if (isInPlaylist) {
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2">
                    <polyline points="20,6 9,17 4,12"></polyline>
                </svg>
            `;
        } else {
            button.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            `;
        }
        
        button.title = isInPlaylist ? 'Remover da lista' : 'Adicionar à lista';
        button.classList.toggle('added', isInPlaylist);

        button.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            z-index: 15;
        `;

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const codigo = button.dataset.codigo;
            
            console.log('🖱️ Botão clicado para código:', codigo);
            console.log('📋 Lista atual antes da ação:', { length: this.currentPlaylist.length, items: [...this.currentPlaylist] });
            
            if (this.hasLouvor(codigo)) {
                console.log('➖ Removendo código da lista');
                this.removeLouvor(codigo);
            } else {
                console.log('➕ Adicionando código à lista');
                this.addLouvor(codigo);
            }
        });

        element.style.position = 'relative';
        element.appendChild(button);
    }
}

// Criar instância global apenas se não existir
if (typeof window !== 'undefined') {
    if (!window.playlistManager) {
        console.log('🚀 Criando instância global do PlaylistManager');
        window.playlistManager = new PlaylistManager();
        console.log('✅ Instância global criada com ID:', window.playlistManager.instanceId);
    } else {
        console.log('⚠️ Instância global do PlaylistManager já existe, reutilizando:', window.playlistManager.instanceId);
    }
}
