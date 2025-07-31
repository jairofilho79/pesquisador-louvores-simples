/**
 * PAGES BAR - BARRA DE NAVEGAÇÃO RESPONSIVA
 * Sistema de navegação que se adapta a diferentes dispositivos
 */

class PagesBar {
    constructor() {
        this.config = {
            mobileBreakpoint: 768,
            animationDuration: 300,
            autoHideDelay: 5000
        };
        
        this.state = {
            isInitialized: false,
            isMobile: false,
            isOpen: false,
            currentPage: 'home',
            pages: []
        };
        
        this.elements = {};
        this.eventHandlers = new Map();
        
        // Bind methods
        this.handleResize = this.handleResize.bind(this);
        this.handleToggleClick = this.handleToggleClick.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handlePageClick = this.handlePageClick.bind(this);
    }

    /**
     * Inicializa a barra de páginas
     */
    async init() {
        try {
            console.log('🚀 Inicializando Pages Bar...');
            
            // Verificar se já foi inicializado
            if (this.state.isInitialized) {
                console.warn('⚠️ Pages Bar já foi inicializado');
                return;
            }
            
            // Carregar metadados
            await this.loadPageData();
            
            // Criar estrutura DOM
            this.createDOMStructure();
            
            // Configurar elementos
            this.setupElements();
            
            // Configurar eventos
            this.setupEventListeners();
            
            // Renderizar páginas
            this.renderPages();
            
            // Configurar responsividade
            this.setupResponsive();
            
            // Definir página ativa
            this.setActivePage(this.state.currentPage);
            
            // Forçar visibilidade inicial
            this.ensureVisibility();
            
            // Adicionar classe ao body
            document.body.classList.add('has-pages-bar');
            
            this.state.isInitialized = true;
            console.log('✅ Pages Bar inicializado com sucesso');
            
            // Disparar evento customizado
            this.dispatchEvent('pagesbar:initialized', { 
                pages: this.state.pages,
                currentPage: this.state.currentPage
            });
            
        } catch (error) {
            console.error('❌ Erro ao inicializar Pages Bar:', error);
            throw error;
        }
    }

    /**
     * Carrega dados das páginas do arquivo consolidado
     */
    async loadPageData() {
        try {
            // Aguardar carregamento dos metadados se necessário
            if (typeof window.getPagesBarData !== 'function') {
                await this.waitForMetadata();
            }
            
            const pagesData = window.getPagesBarData();
            this.state.pages = pagesData.pages || [];
            this.config = { ...this.config, ...pagesData.configuracao };
            
            console.log(`📄 Carregadas ${this.state.pages.length} páginas`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados das páginas:', error);
            // Fallback com página padrão
            this.state.pages = [{
                id: 'home',
                nome: 'Início',
                arquivo: 'index.html',
                icone: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
                ativo: true,
                ordem: 1
            }];
        }
    }

    /**
     * Aguarda o carregamento dos metadados
     */
    waitForMetadata(timeout = 5000) {
        return new Promise((resolve, reject) => {
            const checkMetadata = () => {
                if (typeof window.getPagesBarData === 'function') {
                    resolve();
                } else {
                    setTimeout(checkMetadata, 100);
                }
            };
            
            setTimeout(() => reject(new Error('Timeout aguardando metadados')), timeout);
            checkMetadata();
        });
    }

    /**
     * Cria a estrutura DOM da barra
     */
    createDOMStructure() {
        // Verificar se já existe
        if (document.getElementById('pages-bar')) {
            console.log('📄 Estrutura DOM já existe, reutilizando...');
            return;
        }

        // Criar estrutura principal
        const nav = document.createElement('nav');
        nav.id = 'pages-bar';
        nav.className = 'pages-bar';
        nav.setAttribute('role', 'navigation');
        nav.setAttribute('aria-label', 'Navegação principal');

        nav.innerHTML = `
            <div class="pages-bar-container">
                <ul class="pages-bar-items" id="pages-bar-items"></ul>
                
                <button 
                    class="pages-bar-toggle" 
                    id="pages-bar-toggle" 
                    aria-label="Abrir/fechar menu de navegação"
                    aria-expanded="false"
                >
                    <span class="pages-bar-toggle-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>
            </div>
            
            <div class="pages-bar-overlay" id="pages-bar-overlay"></div>
        `;

        // Inserir no início do body
        document.body.insertBefore(nav, document.body.firstChild);
    }

    /**
     * Configura referências dos elementos DOM
     */
    setupElements() {
        this.elements = {
            nav: document.getElementById('pages-bar'),
            container: document.querySelector('.pages-bar-container'),
            items: document.getElementById('pages-bar-items'),
            toggle: document.getElementById('pages-bar-toggle'),
            overlay: document.getElementById('pages-bar-overlay')
        };

        // Verificar se todos os elementos foram encontrados
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                throw new Error(`Elemento ${key} não encontrado`);
            }
        }
    }

    /**
     * Configura todos os event listeners
     */
    setupEventListeners() {
        // Toggle mobile
        this.elements.toggle.addEventListener('click', this.handleToggleClick);
        
        // Overlay mobile
        this.elements.overlay.addEventListener('click', this.handleOverlayClick);
        
        // Resize da janela
        window.addEventListener('resize', this.handleResize);
        
        // Teclas de atalho
        document.addEventListener('keydown', this.handleKeyPress);
        
        // Cliques fora da barra (mobile)
        document.addEventListener('click', (e) => {
            if (this.state.isMobile && this.state.isOpen) {
                if (!this.elements.nav.contains(e.target) && !this.elements.toggle.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
    }

    /**
     * Renderiza os itens de páginas
     */
    renderPages() {
        const fragment = document.createDocumentFragment();
        
        // Filtrar e ordenar páginas ativas
        const activePages = this.state.pages
            .filter(page => page.ativo !== false)
            .sort((a, b) => (a.ordem || 999) - (b.ordem || 999));

        activePages.forEach((page, index) => {
            const item = this.createPageItem(page, index);
            fragment.appendChild(item);
        });

        // Limpar container e adicionar novos itens
        this.elements.items.innerHTML = '';
        this.elements.items.appendChild(fragment);
        
        console.log(`✅ Renderizadas ${activePages.length} páginas`);
    }

    /**
     * Cria um item de página individual
     */
    createPageItem(page, index) {
        const li = document.createElement('li');
        li.className = 'pages-bar-item';
        li.style.animationDelay = `${index * 0.1}s`;

        const link = document.createElement('a');
        link.href = page.arquivo || '#';
        link.className = 'pages-bar-link';
        link.setAttribute('role', 'button');
        link.setAttribute('tabindex', '0');
        link.setAttribute('data-page-id', page.id);
        link.setAttribute('title', page.descricao || page.nome);

        // Container do ícone
        const iconContainer = document.createElement('div');
        iconContainer.className = 'pages-bar-icon-container';
        iconContainer.innerHTML = page.icone || this.getDefaultIcon();

        // Texto
        const text = document.createElement('span');
        text.className = 'pages-bar-text';
        text.textContent = page.nome;

        // Tooltip (para mobile)
        const tooltip = document.createElement('div');
        tooltip.className = 'pages-bar-tooltip';
        tooltip.textContent = page.descricao || page.nome;

        // Montar estrutura
        link.appendChild(iconContainer);
        link.appendChild(text);
        link.appendChild(tooltip);
        li.appendChild(link);

        // Event listener para clique
        link.addEventListener('click', (e) => this.handlePageClick(e, page));

        return li;
    }

    /**
     * Configura comportamento responsivo
     */
    setupResponsive() {
        this.handleResize(); // Configuração inicial
    }

    /**
     * Garante que o componente seja visível
     */
    ensureVisibility() {
        // Forçar visibilidade da barra
        if (this.elements.nav) {
            this.elements.nav.style.display = 'block';
            this.elements.nav.style.visibility = 'visible';
            this.elements.nav.style.opacity = '1';
            
            // Garantir que o toggle apareça no mobile
            if (this.elements.toggle) {
                if (window.innerWidth < this.config.mobileBreakpoint) {
                    this.elements.toggle.style.display = 'flex';
                } else {
                    this.elements.toggle.style.display = 'none';
                }
            }
        }
        
        console.log('👁️ Visibilidade da Pages Bar garantida');
    }

    /**
     * Manipula redimensionamento da janela
     */
    handleResize() {
        const wasMobile = this.state.isMobile;
        this.state.isMobile = window.innerWidth < this.config.mobileBreakpoint;

        // Se mudou de mobile para desktop, fechar menu
        if (wasMobile && !this.state.isMobile && this.state.isOpen) {
            this.closeMobileMenu();
        }

        // Atualizar classes
        this.elements.nav.classList.toggle('is-mobile', this.state.isMobile);
        
        // Garantir visibilidade após resize
        this.ensureVisibility();
    }

    /**
     * Manipula clique no botão toggle (mobile)
     */
    handleToggleClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.state.isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Manipula clique no overlay (mobile)
     */
    handleOverlayClick(e) {
        e.preventDefault();
        this.closeMobileMenu();
    }

    /**
     * Manipula teclas de atalho
     */
    handleKeyPress(e) {
        // ESC para fechar menu mobile
        if (e.key === 'Escape' && this.state.isMobile && this.state.isOpen) {
            this.closeMobileMenu();
        }
        
        // Atalhos numéricos para páginas (1-9)
        if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
            const pageIndex = parseInt(e.key) - 1;
            const pages = this.state.pages.filter(p => p.ativo !== false);
            if (pages[pageIndex]) {
                e.preventDefault();
                this.navigateToPage(pages[pageIndex]);
            }
        }
    }

    /**
     * Manipula clique em página
     */
    handlePageClick(e, page) {
        e.preventDefault();
        this.navigateToPage(page);
    }

    /**
     * Abre menu mobile
     */
    openMobileMenu() {
        this.state.isOpen = true;
        this.elements.nav.classList.add('is-open');
        this.elements.toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('pages-bar-open');
        
        // Focar no primeiro item
        const firstLink = this.elements.items.querySelector('.pages-bar-link');
        if (firstLink) {
            setTimeout(() => firstLink.focus(), 100);
        }
        
        this.dispatchEvent('pagesbar:menu-opened');
    }

    /**
     * Fecha menu mobile
     */
    closeMobileMenu() {
        this.state.isOpen = false;
        this.elements.nav.classList.remove('is-open');
        this.elements.toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('pages-bar-open');
        
        // Retornar foco para o toggle
        this.elements.toggle.focus();
        
        this.dispatchEvent('pagesbar:menu-closed');
    }

    /**
     * Navega para uma página
     */
    navigateToPage(page) {
        console.log(`🔗 Navegando para: ${page.nome} (${page.arquivo})`);
        
        // Fechar menu mobile se aberto
        if (this.state.isMobile && this.state.isOpen) {
            this.closeMobileMenu();
        }
        
        // Definir como página ativa
        this.setActivePage(page.id);
        
        // Disparar evento antes da navegação
        const event = this.dispatchEvent('pagesbar:before-navigate', { 
            from: this.state.currentPage,
            to: page.id,
            page: page
        });
        
        // Se não foi cancelado, navegar
        if (!event.defaultPrevented) {
            // Navegar para a página
            if (page.arquivo && page.arquivo !== window.location.pathname.split('/').pop()) {
                window.location.href = page.arquivo;
            }
            
            this.dispatchEvent('pagesbar:navigated', { page });
        }
    }

    /**
     * Define página ativa
     */
    setActivePage(pageId) {
        this.state.currentPage = pageId;
        
        // Remover classe ativa de todos os links
        this.elements.items.querySelectorAll('.pages-bar-link').forEach(link => {
            link.classList.remove('is-active');
        });
        
        // Adicionar classe ativa ao link correto
        const activeLink = this.elements.items.querySelector(`[data-page-id="${pageId}"]`);
        if (activeLink) {
            activeLink.classList.add('is-active');
        }
        
        this.dispatchEvent('pagesbar:page-changed', { pageId });
    }

    /**
     * Adiciona uma nova página
     */
    addPage(page) {
        this.state.pages.push(page);
        this.renderPages();
        this.dispatchEvent('pagesbar:page-added', { page });
    }

    /**
     * Remove uma página
     */
    removePage(pageId) {
        this.state.pages = this.state.pages.filter(p => p.id !== pageId);
        this.renderPages();
        this.dispatchEvent('pagesbar:page-removed', { pageId });
    }

    /**
     * Atualiza uma página existente
     */
    updatePage(pageId, updates) {
        const pageIndex = this.state.pages.findIndex(p => p.id === pageId);
        if (pageIndex !== -1) {
            this.state.pages[pageIndex] = { ...this.state.pages[pageIndex], ...updates };
            this.renderPages();
            this.dispatchEvent('pagesbar:page-updated', { pageId, updates });
        }
    }

    /**
     * Obtém ícone padrão
     */
    getDefaultIcon() {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </svg>`;
    }

    /**
     * Dispara evento customizado
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
        return event;
    }

    /**
     * Destrói a instância
     */
    destroy() {
        // Remover event listeners
        this.elements.toggle?.removeEventListener('click', this.handleToggleClick);
        this.elements.overlay?.removeEventListener('click', this.handleOverlayClick);
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.handleKeyPress);
        
        // Remover classes do body
        document.body.classList.remove('has-pages-bar', 'pages-bar-open');
        
        // Remover elementos DOM
        this.elements.nav?.remove();
        
        // Limpar estado
        this.state.isInitialized = false;
        
        this.dispatchEvent('pagesbar:destroyed');
        console.log('🗑️ Pages Bar destruído');
    }
}

// ===================================================================
// UTILITÁRIOS E FUNÇÕES AUXILIARES
// ===================================================================

/**
 * Função para inicializar automaticamente quando o DOM estiver pronto
 */
function initPagesBarWhenReady() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initPagesBar();
        });
    } else {
        initPagesBar();
    }
}

/**
 * Inicializa a Pages Bar
 */
async function initPagesBar() {
    try {
        // Criar instância global
        window.pagesBar = new PagesBar();
        await window.pagesBar.init();
    } catch (error) {
        console.error('❌ Falha ao inicializar Pages Bar:', error);
    }
}

/**
 * Função para obter a instância atual
 */
function getPagesBarInstance() {
    return window.pagesBar || null;
}

// ===================================================================
// EXPORTAR PARA USO GLOBAL
// ===================================================================
window.PagesBar = PagesBar;
window.initPagesBar = initPagesBar;
window.getPagesBarInstance = getPagesBarInstance;

// ===================================================================
// AUTO-INICIALIZAÇÃO
// ===================================================================
// Inicializar automaticamente a menos que seja explicitamente desabilitado
if (typeof window.PAGES_BAR_AUTO_INIT === 'undefined' || window.PAGES_BAR_AUTO_INIT) {
    initPagesBarWhenReady();
}

console.log('📦 Pages Bar JavaScript carregado');
