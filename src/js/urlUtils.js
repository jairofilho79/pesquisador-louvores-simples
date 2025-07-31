/**
 * Utilitários para manipulação de URLs - Funciona tanto em ambiente local quanto produção
 */
class URLUtils {
    /**
     * Detecta se estamos em ambiente local
     * @returns {boolean} true se for ambiente local
     */
    static isLocalEnvironment() {
        const hostname = window.location.hostname;
        const port = window.location.port;
        
        // Regex para detectar ambientes locais
        const localPatterns = [
            /^localhost$/i,
            /^127\.0\.0\.1$/,
            /^0\.0\.0\.0$/,
            /^192\.168\.\d+\.\d+$/,
            /^10\.\d+\.\d+\.\d+$/,
            /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
            /.*\.local$/i
        ];
        
        // Verificar se hostname corresponde a padrões locais
        const isLocalHost = localPatterns.some(pattern => pattern.test(hostname));
        
        // Verificar se há porta (indicativo de desenvolvimento)
        const hasPort = port && port !== '80' && port !== '443';
        
        console.log('🌐 Detecção de ambiente:', {
            hostname,
            port,
            isLocalHost,
            hasPort,
            isLocal: isLocalHost || hasPort
        });
        
        return isLocalHost || hasPort;
    }

    /**
     * Constrói o path base correto baseado no ambiente
     * @returns {string} Path base (/ para local, /pesquisador-louvores-simples/ para produção)
     */
    static getBasePath() {
        const isLocal = this.isLocalEnvironment();
        const basePath = isLocal ? '/' : '/pesquisador-louvores-simples/';
        
        console.log(`🛤️ Path base determinado: "${basePath}" (ambiente: ${isLocal ? 'local' : 'produção'})`);
        
        return basePath;
    }

    /**
     * Constrói URL completa com host + path base + parâmetros
     * @param {string} params - Parâmetros da query string (opcional)
     * @returns {string} URL completa
     */
    static buildFullUrl(params = '') {
        const origin = window.location.origin;
        const basePath = this.getBasePath();
        const fullUrl = `${origin}${basePath}`;
        
        const finalUrl = params ? `${fullUrl}?${params}` : fullUrl;
        
        console.log('🔗 URL construída:', {
            origin,
            basePath,
            params,
            finalUrl
        });
        
        return finalUrl;
    }

    /**
     * Atualiza URL atual preservando o path base correto
     * @param {URLSearchParams} urlParams - Parâmetros da URL
     * @returns {string} URL atualizada
     */
    static updateCurrentUrl(urlParams) {
        const basePath = this.getBasePath();
        const paramString = urlParams.toString();
        const newUrl = paramString ? `${basePath}?${paramString}` : basePath;
        
        console.log('🔄 URL atualizada:', {
            basePath,
            paramString,
            newUrl
        });
        
        return newUrl;
    }

    /**
     * Navega para URL respeitando o ambiente
     * @param {string} params - Parâmetros da query string (opcional)
     * @param {boolean} newTab - Se deve abrir em nova aba (default: false)
     */
    static navigateTo(params = '', newTab = false) {
        const url = this.buildFullUrl(params);
        
        if (newTab) {
            window.open(url, '_blank');
            console.log('🆕 Abrindo em nova aba:', url);
        } else {
            window.location.href = url;
            console.log('🔄 Navegando para:', url);
        }
    }

    /**
     * Atualiza a URL atual via history API
     * @param {URLSearchParams} urlParams - Parâmetros da URL
     */
    static replaceCurrentUrl(urlParams) {
        const newUrl = this.updateCurrentUrl(urlParams);
        window.history.replaceState({}, '', newUrl);
        console.log('📝 URL substituída via history:', newUrl);
    }

    /**
     * Copia URL atual para área de transferência
     * @returns {Promise<string>} URL copiada
     */
    static async copyCurrentUrl() {
        const currentUrl = window.location.href;
        
        try {
            await navigator.clipboard.writeText(currentUrl);
            console.log('📋 URL copiada:', currentUrl);
            return currentUrl;
        } catch (error) {
            console.error('❌ Erro ao copiar URL:', error);
            throw error;
        }
    }

    /**
     * Valida se uma URL é válida
     * @param {string} url - URL para validar
     * @returns {boolean} true se válida
     */
    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
}

// Expor globalmente
if (typeof window !== 'undefined') {
    window.URLUtils = URLUtils;
    console.log('🌐 URLUtils carregado e disponível globalmente');
} else {
    console.log(window, 'não está definido. URLUtils não será exposto globalmente.');
}
