// Gerenciador de carregamento da aplicação
class AppLoader {
    constructor() {
        this.loadingSteps = [
            'Carregando dados dos louvores...',
            'Inicializando componentes...',
            'Configurando busca...',
            'Preparando interface...'
        ];
        this.currentStep = 0;
        this.isLoaded = false;
        this.loadingStartTime = Date.now();
    }

    // Criar indicador de carregamento
    createLoadingIndicator() {
        const existingLoader = document.getElementById('app-loader');
        if (existingLoader) {
            existingLoader.remove();
        }

        const loader = document.createElement('div');
        loader.id = 'app-loader';
        loader.innerHTML = `
            <div class="loader-overlay">
                <div class="loader-content">
                    <div class="loader-spinner"></div>
                    <h3>Carregando Coletânea Digital</h3>
                    <p id="loader-status">${this.loadingSteps[0]}</p>
                    <div class="loader-progress">
                        <div class="loader-progress-bar" id="loader-progress-bar"></div>
                    </div>
                    <small id="loader-detail">Iniciando...</small>
                </div>
            </div>
        `;

        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            #app-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                background: rgba(52, 58, 64, 0.95);
                backdrop-filter: blur(5px);
            }

            .loader-overlay {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
            }

            .loader-content {
                text-align: center;
                color: #f8f9fa;
                max-width: 400px;
                padding: 2rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            .loader-spinner {
                width: 48px;
                height: 48px;
                margin: 0 auto 1.5rem;
                border: 4px solid rgba(255, 255, 255, 0.3);
                border-left: 4px solid #fff;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loader-content h3 {
                margin: 0 0 1rem;
                font-size: 1.5rem;
                font-weight: 600;
            }

            .loader-content p {
                margin: 0 0 1.5rem;
                font-size: 1rem;
                opacity: 0.9;
            }

            .loader-progress {
                background: rgba(255, 255, 255, 0.2);
                border-radius: 10px;
                height: 8px;
                margin: 1rem 0;
                overflow: hidden;
            }

            .loader-progress-bar {
                height: 100%;
                background: linear-gradient(90deg, #28a745, #20c997);
                border-radius: 10px;
                width: 0%;
                transition: width 0.3s ease;
            }

            .loader-content small {
                opacity: 0.7;
                font-size: 0.875rem;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(loader);

        // Desabilitar interação com o resto da página
        this.disablePageInteraction();

        return loader;
    }

    // Atualizar progresso do carregamento
    updateProgress(step, detail = '') {
        this.currentStep = step;
        const progress = ((step + 1) / this.loadingSteps.length) * 100;

        const statusEl = document.getElementById('loader-status');
        const progressBar = document.getElementById('loader-progress-bar');
        const detailEl = document.getElementById('loader-detail');

        if (statusEl && step < this.loadingSteps.length) {
            statusEl.textContent = this.loadingSteps[step];
        }

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }

        if (detailEl && detail) {
            detailEl.textContent = detail;
        }

        console.log(`[AppLoader] ${this.loadingSteps[step]} ${detail ? '- ' + detail : ''}`);
    }

    // Desabilitar interação com a página
    disablePageInteraction() {
        const mainContent = document.getElementById('pesquisador-simples');
        if (mainContent) {
            mainContent.style.pointerEvents = 'none';
            mainContent.style.opacity = '0.5';
        }
    }

    // Habilitar interação com a página
    enablePageInteraction() {
        const mainContent = document.getElementById('pesquisador-simples');
        if (mainContent) {
            mainContent.style.pointerEvents = 'auto';
            mainContent.style.opacity = '1';
        }
    }

    // Remover indicador de carregamento
    removeLoadingIndicator() {
        const loader = document.getElementById('app-loader');
        if (loader) {
            loader.style.opacity = '0';
            loader.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                loader.remove();
                this.enablePageInteraction();
            }, 300);
        }

        const loadTime = Date.now() - this.loadingStartTime;
        console.log(`[AppLoader] Aplicação carregada em ${loadTime}ms`);
    }

    // Carregar script com Promise melhorada
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Verificar se o script já foi carregado
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                console.log(`[AppLoader] Script já carregado: ${src}`);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src;
            
            script.onload = () => {
                console.log(`[AppLoader] ✅ Script carregado: ${src}`);
                resolve();
            };
            
            script.onerror = (error) => {
                console.error(`[AppLoader] ❌ Erro ao carregar: ${src}`, error);
                reject(new Error(`Falha ao carregar ${src}`));
            };
            
            document.head.appendChild(script);
            
            // Timeout de segurança
            setTimeout(() => {
                if (!script.onload.called) {
                    reject(new Error(`Timeout ao carregar ${src}`));
                }
            }, 10000); // 10 segundos timeout
        });
    }

    // Carregar múltiplos scripts em sequência (mais confiável que paralelo)
    async loadScriptsSequential(scriptSources) {
        console.log(`[AppLoader] Carregando ${scriptSources.length} scripts sequencialmente...`);
        
        try {
            for (let i = 0; i < scriptSources.length; i++) {
                const src = scriptSources[i];
                console.log(`[AppLoader] Carregando script ${i + 1}/${scriptSources.length}: ${src}`);
                await this.loadScript(src);
                
                // Aguardar um pouco entre scripts para garantir execução
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            console.log('[AppLoader] Todos os scripts carregados sequencialmente');
            return true;
        } catch (error) {
            console.error('[AppLoader] Erro ao carregar scripts:', error);
            throw error;
        }
    }

    // Aguardar que os componentes estejam disponíveis
    async waitForComponents() {
        const maxAttempts = 100; // 10 segundos máximo
        let attempts = 0;

        return new Promise((resolve, reject) => {
            const checkComponents = () => {
                attempts++;

                // Verificar se todas as classes estão disponíveis
                const hasSearchComponent = typeof window.SearchComponent === 'function';
                const hasSearchOptionsComponent = typeof window.SearchOptionsComponent === 'function';
                const hasSearchOptionComponent = typeof window.SearchOptionComponent === 'function';
                const hasLouvoresData = window.louvoresAssets2ComCodigos && Array.isArray(window.louvoresAssets2ComCodigos);

                console.log(`[AppLoader] Check ${attempts}: SearchComponent=${hasSearchComponent}, SearchOptionsComponent=${hasSearchOptionsComponent}, SearchOptionComponent=${hasSearchOptionComponent}, Data=${hasLouvoresData}`);

                if (hasSearchComponent && hasSearchOptionsComponent && hasSearchOptionComponent && hasLouvoresData) {
                    console.log('[AppLoader] Todas as classes carregadas, verificando instâncias...');
                    
                    // Aguardar mais um pouco para garantir que as instâncias foram criadas
                    setTimeout(() => {
                        const hasSearchInstance = window.searchComponent;
                        const hasSearchOptionsInstance = window.searchOptionsComponent;
                        const hasSearchOptionInstance = window.searchOptionComponent;
                        
                        if (hasSearchInstance && hasSearchOptionsInstance && hasSearchOptionInstance) {
                            console.log('[AppLoader] Todos os componentes inicializados');
                            resolve();
                        } else {
                            console.log('[AppLoader] Classes prontas, mas instâncias ainda não criadas');
                            setTimeout(checkComponents, 100);
                        }
                    }, 200);
                } else if (attempts >= maxAttempts) {
                    const missing = [];
                    if (!hasSearchComponent) missing.push('SearchComponent class');
                    if (!hasSearchOptionsComponent) missing.push('SearchOptionsComponent class');
                    if (!hasSearchOptionComponent) missing.push('SearchOptionComponent class');
                    if (!hasLouvoresData) missing.push('LouvoresData');
                    
                    reject(new Error(`Timeout: Componentes não carregados: ${missing.join(', ')}`));
                } else {
                    console.log(`[AppLoader] Aguardando componentes... (${attempts}/${maxAttempts})`);
                    setTimeout(checkComponents, 100);
                }
            };

            checkComponents();
        });
    }

    // Processo completo de carregamento
    async loadApplication() {
        console.log('[AppLoader] Iniciando carregamento da aplicação...');
        
        // Mostrar indicador
        this.createLoadingIndicator();

        try {
            // Passo 1: Carregar dados dos louvores
            this.updateProgress(0, 'Conectando ao servidor...');
            await window.versionedAssetLoader.loadLatestVersion();

            // Passo 2: Carregar componentes sequencialmente
            this.updateProgress(1, 'Carregando módulos...');
            const componentScripts = [
                'src/js/searchComponent.js',
                'src/js/searchOptionsComponent.js', 
                'src/js/searchOptionComponent.js'
            ];
            
            await this.loadScriptsSequential(componentScripts);

            // Passo 3: Inicializar componentes
            this.updateProgress(2, 'Inicializando módulos...');
            await this.loadScript('src/js/initializeComponents.js');

            // Passo 4: Aguardar inicialização completa
            this.updateProgress(3, 'Finalizando...');
            await this.waitForComponents();

            // Finalizar
            this.isLoaded = true;
            this.removeLoadingIndicator();

            console.log('[AppLoader] Aplicação pronta para uso!');
            
            // Notificar que a aplicação está pronta
            document.dispatchEvent(new CustomEvent('appReady'));

        } catch (error) {
            console.error('[AppLoader] Erro no carregamento:', error);
            
            // Mostrar erro detalhado na interface
            const statusEl = document.getElementById('loader-status');
            const detailEl = document.getElementById('loader-detail');
            
            if (statusEl) statusEl.textContent = 'Erro no carregamento';
            if (detailEl) {
                detailEl.innerHTML = `
                    <strong>Erro:</strong> ${error.message}<br>
                    <small>Tentando carregamento alternativo em 3 segundos...</small>
                `;
            }

            console.log('[AppLoader] Estado atual:');
            console.log('- versionedAssetLoader:', !!window.versionedAssetLoader);
            console.log('- louvoresAssets2ComCodigos:', !!window.louvoresAssets2ComCodigos);
            console.log('- SearchComponent:', typeof window.SearchComponent);
            console.log('- SearchOptionsComponent:', typeof window.SearchOptionsComponent);
            console.log('- SearchOptionComponent:', typeof window.SearchOptionComponent);

            // Tentar fallback após 3 segundos
            setTimeout(() => {
                this.loadFallback();
            }, 3000);
        }
    }

    // Carregamento de fallback
    async loadFallback() {
        console.log('[AppLoader] 🔄 Iniciando carregamento de fallback...');
        
        const statusEl = document.getElementById('loader-status');
        const detailEl = document.getElementById('loader-detail');
        
        try {
            if (statusEl) statusEl.textContent = 'Carregamento alternativo...';
            if (detailEl) detailEl.textContent = 'Carregando dados estáticos...';

            // Tentar carregar versão estática se não estiver carregada
            if (!window.louvoresAssets2ComCodigos) {
                console.log('[AppLoader] Carregando assets2-louvores-com-codigos.js diretamente...');
                await this.loadScript('assets2-louvores-com-codigos.js');
                
                // Verificar se foi carregado
                if (!window.louvoresAssets2ComCodigos) {
                    throw new Error('Falha ao carregar dados dos louvores');
                }
            }

            if (detailEl) detailEl.textContent = 'Carregando componentes...';
            
            // Carregar componentes sequencialmente se não estiverem carregados
            const componentsToLoad = [];
            
            if (typeof window.SearchComponent !== 'function') {
                componentsToLoad.push('src/js/searchComponent.js');
            }
            if (typeof window.SearchOptionsComponent !== 'function') {
                componentsToLoad.push('src/js/searchOptionsComponent.js');
            }
            if (typeof window.SearchOptionComponent !== 'function') {
                componentsToLoad.push('src/js/searchOptionComponent.js');
            }

            console.log(`[AppLoader] Componentes a carregar: ${componentsToLoad.length}`);
            
            for (const script of componentsToLoad) {
                console.log(`[AppLoader] Carregando: ${script}`);
                await this.loadScript(script);
                await new Promise(resolve => setTimeout(resolve, 200)); // Pausa entre scripts
            }

            // Carregar inicializador se necessário
            if (!window.searchComponent || !window.searchOptionsComponent || !window.searchOptionComponent) {
                console.log('[AppLoader] Carregando inicializador...');
                await this.loadScript('src/js/initializeComponents.js');
                
                // Aguardar inicialização
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Verificar se tudo está pronto
            await this.waitForComponents();

            this.isLoaded = true;
            this.removeLoadingIndicator();
            
            console.log('[AppLoader] ✅ Fallback executado com sucesso');
            document.dispatchEvent(new CustomEvent('appReady'));

        } catch (error) {
            console.error('[AppLoader] ❌ Falha crítica no fallback:', error);
            
            if (statusEl) statusEl.textContent = 'Falha crítica no carregamento';
            if (detailEl) {
                detailEl.innerHTML = `
                    <strong>Não foi possível carregar a aplicação.</strong><br>
                    <small>Erro: ${error.message}</small><br>
                    <button onclick="location.reload()" style="margin-top: 10px; padding: 5px 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        🔄 Recarregar Página
                    </button>
                `;
            }
        }
    }
}

// Instância global
window.appLoader = new AppLoader();
