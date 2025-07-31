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
            console.log('📊 Carregando dados das páginas...');
            
            // Aguardar carregamento dos metadados se necessário
            if (typeof window.getPagesBarData !== 'function') {
                console.log('⏳ Aguardando metadados consolidados...');
                await this.waitForMetadata();
            }
            
            const pagesData = window.getPagesBarData();
            
            // Validar dados recebidos
            if (!pagesData || !pagesData.pages) {
                throw new Error('Dados de páginas inválidos');
            }
            
            this.state.pages = pagesData.pages || [];
            
            // Mesclar configurações, priorizando as do arquivo
            if (pagesData.configuracao) {
                this.config = { ...this.config, ...pagesData.configuracao };
                
                // Aplicar cores CSS customizadas se existirem
                if (pagesData.configuracao.cores) {
                    this.applyCSSCustomProperties(pagesData.configuracao.cores);
                }
            }
            
            // Cache dos dados para performance
            this.cachePageData(pagesData);
            
            console.log(`✅ Carregadas ${this.state.pages.length} páginas:`);
            this.state.pages.forEach(page => {
                console.log(`  - ${page.nome} (${page.arquivo}) - Ativo: ${page.ativo !== false}`);
            });
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados das páginas:', error);
            // Fallback com dados mínimos
            this.loadFallbackData();
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
     * Aplica propriedades CSS customizadas
     */
    applyCSSCustomProperties(cores) {
        const root = document.documentElement;
        
        if (cores.background) root.style.setProperty('--pages-bar-bg', cores.background);
        if (cores.borda) root.style.setProperty('--pages-bar-border', cores.borda);
        if (cores.texto) root.style.setProperty('--pages-bar-text', cores.texto);
        if (cores.hover) root.style.setProperty('--pages-bar-hover', cores.hover);
        if (cores.ativo) root.style.setProperty('--pages-bar-active', cores.ativo);
        
        console.log('🎨 Propriedades CSS aplicadas:', cores);
    }

    /**
     * Cache dos dados da página para performance
     */
    cachePageData(pagesData) {
        try {
            const cacheKey = 'pages-bar-data';
            const cacheData = {
                data: pagesData,
                timestamp: Date.now(),
                version: pagesData.version || '1.0.0'
            };
            
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
            console.log('💾 Dados em cache salvos');
        } catch (error) {
            console.warn('⚠️ Não foi possível salvar cache:', error);
        }
    }

    /**
     * Carrega dados de fallback em caso de erro
     */
    loadFallbackData() {
        console.log('🔄 Carregando dados de fallback...');
        
        // Tentar cache primeiro
        try {
            const cached = localStorage.getItem('pages-bar-data');
            if (cached) {
                const cacheData = JSON.parse(cached);
                // Usar cache se for recente (menos de 1 hora)
                if (Date.now() - cacheData.timestamp < 3600000) {
                    this.state.pages = cacheData.data.pages || [];
                    console.log('✅ Dados carregados do cache');
                    return;
                }
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar cache:', error);
        }
        
        // Dados mínimos de emergência
        this.state.pages = [{
            id: 'home',
            nome: 'Início',
            arquivo: 'index.html',
            icone: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>',
            descricao: 'Página principal da coletânea digital',
            ativo: true,
            ordem: 1
        }];
        
        console.log('⚠️ Usando dados de fallback mínimos');
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
            e.preventDefault();
            this.closeMobileMenu();
            return;
        }
        
        // Atalhos numéricos para páginas (Ctrl + 1-9)
        if (e.ctrlKey && e.key >= '1' && e.key <= '9') {
            const pageIndex = parseInt(e.key) - 1;
            const pages = this.state.pages.filter(p => p.ativo !== false);
            if (pages[pageIndex]) {
                e.preventDefault();
                this.navigateToPage(pages[pageIndex]);
                this.showKeyboardFeedback(pages[pageIndex].nome);
            }
            return;
        }
        
        // Alt + M para toggle do menu mobile
        if (e.altKey && e.key.toLowerCase() === 'm' && this.state.isMobile) {
            e.preventDefault();
            this.handleToggleClick(e);
            return;
        }
        
        // Alt + H para home
        if (e.altKey && e.key.toLowerCase() === 'h') {
            const homePage = this.state.pages.find(p => p.id === 'home' || p.ordem === 1);
            if (homePage) {
                e.preventDefault();
                this.navigateToPage(homePage);
                this.showKeyboardFeedback('Navegação rápida: ' + homePage.nome);
            }
            return;
        }
        
        // Setas para navegação entre páginas (quando menu está focado)
        if (document.activeElement && document.activeElement.closest('.pages-bar')) {
            this.handleArrowNavigation(e);
        }
        
        // Ctrl + Alt + P para debug das páginas
        if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            this.debugPages();
        }
    }

    /**
     * Navegação por setas no teclado
     */
    handleArrowNavigation(e) {
        const currentFocus = document.activeElement;
        const links = Array.from(this.elements.items.querySelectorAll('.pages-bar-link'));
        const currentIndex = links.indexOf(currentFocus);
        
        if (currentIndex === -1) return;
        
        let nextIndex = currentIndex;
        
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            nextIndex = (currentIndex + 1) % links.length;
            e.preventDefault();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            nextIndex = currentIndex === 0 ? links.length - 1 : currentIndex - 1;
            e.preventDefault();
        } else if (e.key === 'Home') {
            nextIndex = 0;
            e.preventDefault();
        } else if (e.key === 'End') {
            nextIndex = links.length - 1;
            e.preventDefault();
        }
        
        if (nextIndex !== currentIndex) {
            links[nextIndex].focus();
            this.showKeyboardFeedback(`Navegando: ${links[nextIndex].dataset.pageId}`);
        }
    }

    /**
     * Feedback visual para atalhos de teclado
     */
    showKeyboardFeedback(message) {
        // Remover feedback anterior
        const existing = document.querySelector('.pages-bar-keyboard-feedback');
        if (existing) {
            existing.remove();
        }
        
        // Criar novo feedback
        const feedback = document.createElement('div');
        feedback.className = 'pages-bar-keyboard-feedback';
        feedback.textContent = message;
        feedback.setAttribute('role', 'status');
        feedback.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(feedback);
        
        // Auto-remover após 2 segundos
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.remove();
            }
        }, 2000);
    }

    /**
     * Anima a transição entre páginas
     */
    async animatePageTransition(pageData) {
        // Adicionar classe de animação
        this.elements.container.classList.add('pages-bar-transitioning');
        
        try {
            // Animação de saída (fade out)
            await this.addTemporaryClass(document.body, 'pages-bar-page-exit', 150);
            
            // Aqui a página seria carregada/mudada
            await this.simulatePageLoad(pageData);
            
            // Animação de entrada (fade in)
            await this.addTemporaryClass(document.body, 'pages-bar-page-enter', 300);
            
        } finally {
            this.elements.container.classList.remove('pages-bar-transitioning');
        }
    }

    /**
     * Simula carregamento de página
     */
    async simulatePageLoad(pageData) {
        return new Promise(resolve => {
            // Simular delay de carregamento
            setTimeout(() => {
                console.log(`Página ${pageData.nome} carregada`);
                resolve();
            }, 100);
        });
    }

    /**
     * Adiciona classe temporária com Promise
     */
    addTemporaryClass(element, className, duration) {
        return new Promise(resolve => {
            element.classList.add(className);
            setTimeout(() => {
                element.classList.remove(className);
                resolve();
            }, duration);
        });
    }

    /**
     * Adiciona efeitos visuais para feedback
     */
    addVisualFeedback(element, type = 'success') {
        const feedbackClass = `pages-bar-feedback-${type}`;
        
        // Remover feedback anterior
        element.classList.remove('pages-bar-feedback-success', 'pages-bar-feedback-error', 'pages-bar-feedback-warning');
        
        // Adicionar novo feedback
        element.classList.add(feedbackClass);
        
        // Auto-remover após animação
        setTimeout(() => {
            element.classList.remove(feedbackClass);
        }, 600);
    }

    /**
     * Anima entrada do menu mobile
     */
    animateMobileMenuOpen() {
        if (!this.state.isMobile) return;
        
        const overlay = this.elements.container.querySelector('.pages-bar-overlay');
        const items = this.elements.items;
        
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.style.display = 'block';
            
            // Animar fade in do overlay
            requestAnimationFrame(() => {
                overlay.style.transition = 'opacity 0.3s ease';
                overlay.style.opacity = '1';
            });
        }
        
        // Animar slide in dos itens
        items.style.transform = 'translateX(-100%)';
        requestAnimationFrame(() => {
            items.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            items.style.transform = 'translateX(0)';
        });
    }

    /**
     * Anima saída do menu mobile
     */
    animateMobileMenuClose() {
        if (!this.state.isMobile) return;
        
        const overlay = this.elements.container.querySelector('.pages-bar-overlay');
        const items = this.elements.items;
        
        return new Promise(resolve => {
            // Animar slide out dos itens
            items.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            items.style.transform = 'translateX(-100%)';
            
            // Animar fade out do overlay
            if (overlay) {
                overlay.style.transition = 'opacity 0.3s ease';
                overlay.style.opacity = '0';
            }
            
            // Aguardar animação terminar
            setTimeout(() => {
                if (overlay) {
                    overlay.style.display = 'none';
                }
                items.style.transform = '';
                items.style.transition = '';
                resolve();
            }, 300);
        });
    }

    /**
     * Debug das páginas (desenvolvimento)
     */
    debugPages() {
        console.group('🔍 Debug Pages Bar');
        console.log('Estado atual:', this.state);
        console.log('Configuração:', this.config);
        console.log('Elementos DOM:', this.elements);
        console.log('Páginas ativas:', this.state.pages.filter(p => p.ativo !== false));
        console.log('Histórico:', this.state.history);
        console.groupEnd();
        
        this.showKeyboardFeedback('Debug info no console');
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
    async openMobileMenu() {
        this.state.isOpen = true;
        this.elements.nav.classList.add('is-open', 'mobile-opening');
        this.elements.toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('pages-bar-open');
        
        // Animar entrada
        await this.animateMobileMenuOpen();
        
        // Remover classe de animação
        this.elements.nav.classList.remove('mobile-opening');
        
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
    async closeMobileMenu() {
        this.elements.nav.classList.add('mobile-closing');
        
        // Animar saída
        await this.animateMobileMenuClose();
        
        this.state.isOpen = false;
        this.elements.nav.classList.remove('is-open', 'mobile-closing');
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
        
        // Validar página
        if (!page || !page.id) {
            console.error('❌ Página inválida para navegação');
            return;
        }
        
        // Verificar se já estamos na página
        if (this.state.currentPage === page.id) {
            console.log('ℹ️ Já estamos na página solicitada');
            this.closeMobileMenu(); // Apenas fechar menu se mobile
            return;
        }
        
        // Fechar menu mobile se aberto
        if (this.state.isMobile && this.state.isOpen) {
            this.closeMobileMenu();
        }
        
        // Mostrar indicador de loading
        this.showLoadingState(page.id);
        
        // Salvar no histórico
        this.addToHistory(this.state.currentPage, page.id);
        
        // Definir como página ativa
        this.setActivePage(page.id);
        
        // Disparar evento antes da navegação
        const event = this.dispatchEvent('pagesbar:before-navigate', { 
            from: this.state.currentPage,
            to: page.id,
            page: page,
            timestamp: Date.now()
        });
        
        // Se não foi cancelado, navegar
        if (!event.defaultPrevented) {
            this.performNavigation(page);
        } else {
            // Reverter estado se navegação foi cancelada
            this.hideLoadingState();
            console.log('⚠️ Navegação cancelada por event listener');
        }
    }

    /**
     * Executa a navegação efetivamente
     */
    async performNavigation(page) {
        try {
            // Adicionar feedback visual
            const activeLink = this.elements.items.querySelector(`[data-page-id="${page.id}"]`);
            if (activeLink) {
                this.addVisualFeedback(activeLink, 'success');
            }
            
            // Animar transição
            await this.animatePageTransition(page);
            
            // Verificar se é navegação externa ou interna
            const currentPath = window.location.pathname.split('/').pop();
            const isExternalNavigation = page.arquivo && page.arquivo !== currentPath;
            
            if (isExternalNavigation) {
                // Navegação externa (mudança de página)
                this.navigateExternal(page);
            } else {
                // Navegação interna (mesma página, diferentes seções)
                this.navigateInternal(page);
            }
            
        } catch (error) {
            console.error('❌ Erro durante navegação:', error);
            this.hideLoadingState();
            this.showNavigationError(page, error);
            
            // Feedback visual de erro
            const activeLink = this.elements.items.querySelector(`[data-page-id="${page.id}"]`);
            if (activeLink) {
                this.addVisualFeedback(activeLink, 'error');
            }
        }
    }

    /**
     * Navegação para página externa
     */
    navigateExternal(page) {
        console.log(`🌐 Navegação externa: ${page.arquivo}`);
        
        // Adicionar delay para UX suave
        setTimeout(() => {
            window.location.href = page.arquivo;
        }, 150);
        
        // Evento após navegação (será disparado na nova página)
        this.dispatchEvent('pagesbar:navigated', { 
            page, 
            type: 'external',
            timestamp: Date.now()
        });
    }

    /**
     * Navegação interna (mesma página)
     */
    navigateInternal(page) {
        console.log(`🏠 Navegação interna: ${page.id}`);
        
        // Ocultar loading após um delay mínimo para UX
        setTimeout(() => {
            this.hideLoadingState();
        }, 300);
        
        this.dispatchEvent('pagesbar:navigated', { 
            page, 
            type: 'internal',
            timestamp: Date.now()
        });
    }

    /**
     * Mostra estado de loading para uma página
     */
    showLoadingState(pageId) {
        const link = this.elements.items.querySelector(`[data-page-id="${pageId}"]`);
        if (link) {
            link.classList.add('is-loading');
            link.setAttribute('aria-busy', 'true');
            
            // Adicionar spinner no ícone
            const iconContainer = link.querySelector('.pages-bar-icon-container');
            if (iconContainer) {
                iconContainer.classList.add('is-loading');
            }
        }
        
        // Loading geral da barra
        this.elements.nav.classList.add('is-loading');
        console.log(`⏳ Loading state ativado para: ${pageId}`);
    }

    /**
     * Oculta estado de loading
     */
    hideLoadingState() {
        // Remover loading de todos os links
        this.elements.items.querySelectorAll('.pages-bar-link').forEach(link => {
            link.classList.remove('is-loading');
            link.removeAttribute('aria-busy');
        });
        
        // Remover loading dos ícones
        this.elements.items.querySelectorAll('.pages-bar-icon-container').forEach(icon => {
            icon.classList.remove('is-loading');
        });
        
        // Loading geral da barra
        this.elements.nav.classList.remove('is-loading');
        console.log('✅ Loading state removido');
    }

    /**
     * Adiciona entrada ao histórico de navegação
     */
    addToHistory(fromPageId, toPageId) {
        if (!this.state.history) {
            this.state.history = [];
        }
        
        const historyEntry = {
            from: fromPageId,
            to: toPageId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };
        
        // Limitar histórico a 50 entradas
        this.state.history.push(historyEntry);
        if (this.state.history.length > 50) {
            this.state.history.shift();
        }
        
        // Salvar no localStorage para persistência
        try {
            localStorage.setItem('pages-bar-history', JSON.stringify(this.state.history));
        } catch (error) {
            console.warn('⚠️ Não foi possível salvar histórico:', error);
        }
        
        console.log(`📚 Histórico: ${fromPageId} → ${toPageId}`);
    }

    /**
     * Carrega histórico do localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('pages-bar-history');
            if (saved) {
                this.state.history = JSON.parse(saved);
                console.log(`📚 Histórico carregado: ${this.state.history.length} entradas`);
            }
        } catch (error) {
            console.warn('⚠️ Erro ao carregar histórico:', error);
            this.state.history = [];
        }
    }

    /**
     * Mostra erro de navegação
     */
    showNavigationError(page, error) {
        console.error(`❌ Erro na navegação para ${page.nome}:`, error);
        
        // Criar notificação de erro
        const errorNotification = document.createElement('div');
        errorNotification.className = 'pages-bar-error-notification';
        errorNotification.innerHTML = `
            <div class="pages-bar-error-content">
                <span class="pages-bar-error-icon">⚠️</span>
                <span class="pages-bar-error-message">Erro ao navegar para "${page.nome}"</span>
                <button class="pages-bar-error-close" aria-label="Fechar">&times;</button>
            </div>
        `;
        
        // Adicionar ao DOM
        document.body.appendChild(errorNotification);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (errorNotification.parentNode) {
                errorNotification.remove();
            }
        }, 5000);
        
        // Evento de fechar manual
        const closeBtn = errorNotification.querySelector('.pages-bar-error-close');
        closeBtn.addEventListener('click', () => {
            errorNotification.remove();
        });
        
        this.dispatchEvent('pagesbar:navigation-error', { page, error });
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
