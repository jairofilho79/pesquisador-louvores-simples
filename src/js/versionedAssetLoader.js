// Utilitário para carregamento versionado do assets2-louvores.js
class VersionedAssetLoader {
    constructor() {
        this.versionCheckUrl = 'assets2-version.json';
        this.currentVersion = null;
        this.loadedVersion = null;
    }

    async checkForUpdates() {
        try {
            const response = await fetch(`${this.versionCheckUrl}?t=${Date.now()}`);
            if (!response.ok) {
                console.warn('Não foi possível verificar versão dos assets');
                return false;
            }

            const versionInfo = await response.json();
            this.currentVersion = versionInfo.currentVersion;

            // Verificar se a versão carregada é diferente da atual
            if (window.louvoresAssets2Meta) {
                this.loadedVersion = window.louvoresAssets2Meta.version;
                
                if (this.loadedVersion !== this.currentVersion) {
                    console.log('Nova versão disponível:', this.currentVersion);
                    console.log('Versão carregada:', this.loadedVersion);
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Erro ao verificar atualizações:', error);
            return false;
        }
    }

    async loadLatestVersion(forceReload = false) {
        if (!forceReload && window.louvoresAssets2 && window.louvoresAssets2Meta) {
            console.log('Assets já carregados, versão:', window.louvoresAssets2Meta.version);
            return window.louvoresAssets2;
        }

        try {
            // Verificar versão atual
            const response = await fetch(`${this.versionCheckUrl}?t=${Date.now()}`);
            let versionParam = '';
            
            if (response.ok) {
                const versionInfo = await response.json();
                versionParam = `?v=${versionInfo.currentVersion}`;
                console.log('Carregando assets versão:', versionInfo.currentVersion);
            }

            // Carregar script versionado
            await this.loadScript(`assets2-louvores.js${versionParam}`);
            
            if (window.louvoresAssets2) {
                console.log('Assets carregados com sucesso!');
                return window.louvoresAssets2;
            } else {
                throw new Error('Falha ao carregar dados dos assets');
            }

        } catch (error) {
            console.error('Erro ao carregar versão mais recente:', error);
            throw error;
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Remover script anterior se existir
            const existingScript = document.querySelector(`script[src^="assets2-louvores.js"]`);
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            
            document.head.appendChild(script);
        });
    }

    // Método para notificar usuário sobre atualizações
    async notifyIfUpdateAvailable() {
        const hasUpdate = await this.checkForUpdates();
        
        if (hasUpdate) {
            console.log('🔄 Nova versão dos louvores disponível!');
            
            // Opcional: mostrar notificação visual ao usuário
            if (this.onUpdateAvailable) {
                this.onUpdateAvailable(this.currentVersion, this.loadedVersion);
            }
            
            return true;
        }
        
        return false;
    }

    // Callback para quando atualização estiver disponível
    onUpdateAvailable = null;
}

// Instância global
window.versionedAssetLoader = new VersionedAssetLoader();

// Verificar atualizações automaticamente a cada 5 minutos em produção
if (typeof document !== 'undefined') {
    setInterval(async () => {
        await window.versionedAssetLoader.notifyIfUpdateAvailable();
    }, 5 * 60 * 1000); // 5 minutos
}
