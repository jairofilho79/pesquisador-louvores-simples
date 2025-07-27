// Search Option Component Logic
class SearchOptionComponent {
    constructor() {
        this.template = document.getElementById('search-option-template');
    }

    createSearchOption(louvor) {
        console.log('🏗️ DIAGNÓSTICO: createSearchOption chamado para:', {
            nome: louvor.nome,
            status: louvor.status,
            codigo: louvor.codigo,
            categoria: louvor.categoria,
            numero: louvor.numero
        });
        
        if (!this.template) {
            console.error('Template search-option-template não encontrado');
            return document.createElement('div');
        }

        const clone = this.template.content.cloneNode(true);
        console.log('✅ Template clonado com sucesso');

        // Fill in the data usando os seletores corretos com data-field
        const nome = clone.querySelector('[data-field="nome"]');
        const numero = clone.querySelector('[data-field="numero"]');
        const classificacao = clone.querySelector('[data-field="classificacao"]');
        const categoria = clone.querySelector('[data-field="categoria"]');
        const colecao = clone.querySelector('[data-field="colecao"]');

        console.log('🔍 Elementos encontrados:', {
            nome: !!nome,
            numero: !!numero,
            classificacao: !!classificacao,
            categoria: !!categoria,
            colecao: !!colecao
        });

        // Verificar se os elementos foram encontrados
        if (!nome || !numero || !classificacao || !categoria || !colecao) {
            console.error('Elementos do template não encontrados:', {
                nome: !!nome,
                numero: !!numero,
                classificacao: !!classificacao,
                categoria: !!categoria,
                colecao: !!colecao
            });
            return document.createElement('div');
        }

        // Preencher nome
        if (nome) {
            nome.textContent = louvor.nome || 'Nome não disponível';
        }
        
        // Mostrar número se disponível
        if (louvor.numero !== undefined && louvor.numero !== null && louvor.numero !== '') {
            numero.textContent = louvor.numero;
        } else {
            numero.style.display = 'none';
        }

        // Mostrar classificacao se disponível
        if (louvor.classificacao) {
            classificacao.textContent = this.formatClassificacao(louvor.classificacao);
        } else {
            classificacao.style.display = 'none';
        }

        // Mostrar categoria se disponível
        if (louvor.categoria) {
            categoria.textContent = louvor.categoria;
        } else {
            categoria.style.display = 'none';
        }

        // Mostrar coleção se disponível
        const colecaoNome = this.extractColecaoFromPath(louvor.caminhoCompleto);
        if (colecaoNome) {
            colecao.textContent = this.formatColecao(colecaoNome);
        } else {
            colecao.style.display = 'none';
        }

        // Configurar opções de PDF - buscar o elemento pai correto
        const card = clone.querySelector('.search-option-louvor-card');
        console.log('🎴 Card encontrado:', !!card);
        
        if (card) {
            // Adicionar o código real do louvor como atributo de dados
            if (louvor.codigo) {
                card.setAttribute('data-louvor-codigo', louvor.codigo);
                console.log('🏷️ Código setado no card:', louvor.codigo);
            }
            
            console.log('🎨 Chamando setupPdfOptions...');
            this.setupPdfOptions(card, louvor);
        } else {
            console.error('❌ Card não encontrado no template!');
        }

        console.log('✅ createSearchOption concluído para:', louvor.nome);
        return clone;
    }

    setupPdfOptions(card, louvor) {
        console.log('🎨 setupPdfOptions chamado para:', louvor.nome, 'status:', louvor.status);
        
        // Definir cor da borda baseada no status
        if (louvor.status) {
            card.setAttribute('data-status', louvor.status);
            console.log('✅ Atributo data-status definido:', louvor.status);
        } else {
            console.log('⚠️ Louvor sem status:', louvor.nome);
        }

        // Aplicar filtros se o FilterComponent estiver disponível
        let filteredPdfs = louvor.pdfs || [];
        let filteredSubfolders = louvor.subfolders || [];
        
        if (window.filterComponent) {
            filteredPdfs = window.filterComponent.filterFiles(louvor.pdfs || [], 'pdfs');
            filteredSubfolders = window.filterComponent.filterSubfolders(louvor.subfolders || []);
        }

        // Verificar se há conteúdo após filtros
        const hasFilteredPdfs = filteredPdfs.length > 0;
        const hasFilteredSubfolders = filteredSubfolders.length > 0;
        
        if (!hasFilteredPdfs && !hasFilteredSubfolders) {
            // Nenhum conteúdo após filtros
            card.style.opacity = '0.6';
            card.style.cursor = 'not-allowed';
            card.title = 'Nenhum arquivo corresponde aos filtros selecionados';
            card.setAttribute('data-status', 'P');
            
            // Adicionar indicação visual de que foi filtrado
            const filterIndicator = document.createElement('span');
            filterIndicator.className = 'filter-indicator';
            filterIndicator.textContent = '🔍';
            filterIndicator.title = 'Conteúdo filtrado';
            
            const header = card.querySelector('.search-option-louvor-header');
            if (header) {
                header.appendChild(filterIndicator);
            }
            return;
        }

        // Contar total de arquivos filtrados
        const totalFilteredPdfs = filteredPdfs.length;
        const totalFilteredSubfolderFiles = hasFilteredSubfolders ? 
            filteredSubfolders.reduce((total, subfolder) => {
                // Contar apenas PDFs das subpastas
                const subfolderPdfs = (subfolder.pdfs || []).length;
                return total + subfolderPdfs;
            }, 0) : 0;
        const grandTotal = totalFilteredPdfs + totalFilteredSubfolderFiles;

        // Se só há um arquivo filtrado e não há subpastas filtradas, comportamento simples
        const singleMainFile = totalFilteredPdfs === 1;
        if (singleMainFile && !hasFilteredSubfolders) {
            const singleFile = filteredPdfs[0];
            card.addEventListener('click', (e) => {
                window.open(singleFile, '_blank');
            });
            card.style.cursor = 'pointer';
            card.title = `Abrir: ${this.getPdfDisplayName(singleFile)}`;
            return;
        }

        // Múltiplos arquivos filtrados ou subpastas filtradas - criar sistema de collapse
        card.setAttribute('data-multiple-files', 'true');
        card.setAttribute('data-file-count', grandTotal);
        card.style.cursor = 'pointer';
        
        // Atualizar o indicador no header para mostrar total de arquivos filtrados
        this.updateFileCountDisplay(card, grandTotal);
        
        // Criar container principal para arquivos e subpastas filtrados
        const contentContainer = document.createElement('div');
        contentContainer.className = 'file-options-container';
        
        // ========== SEÇÃO: TODOS OS ARQUIVOS (APENAS PDFs) ==========
        const allPdfs = filteredPdfs; // PDFs principais
        const allPdfSubfolders = filteredSubfolders.filter(sub => sub.pdfs && sub.pdfs.length > 0);
        
        if (allPdfs.length > 0 || allPdfSubfolders.length > 0) {
            const pdfSection = this.createMasterSection('Arquivos', allPdfs, allPdfSubfolders, 'pdf');
            contentContainer.appendChild(pdfSection);
        }
        
        // Adicionar indicador de expansão ao card
        const expandIndicator = document.createElement('span');
        expandIndicator.className = 'expand-indicator';
        expandIndicator.textContent = '▼';
        
        // Encontrar o header e adicionar o indicador
        const header = card.querySelector('.search-option-louvor-header');
        if (header) {
            header.appendChild(expandIndicator);
        }
        
        // Adicionar container ao card
        card.appendChild(contentContainer);
        
        // Estado de expansão
        let isExpanded = false;
        
        // Click handler para toggle do collapse COM ACCORDION
        card.addEventListener('click', (e) => {
            // Se clicou numa opção de arquivo, não fazer toggle
            if (e.target.closest('.file-option-item') || e.target.closest('.subfolder-toggle')) {
                return;
            }
            
            // Efeito visual de clique
            card.style.transform = 'scale(0.98)';
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
            
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                // NOVO: Colapsar todos os outros cards antes de expandir este
                this.collapseAllOtherCards(card);
                
                // Primeiro mostrar o elemento
                contentContainer.style.display = 'block';
                contentContainer.classList.add('expanded');
                
                // Forçar layout refresh
                contentContainer.offsetHeight;
                
                // Aplicar estilos com animação
                setTimeout(() => {
                    contentContainer.style.visibility = 'visible';
                    contentContainer.style.opacity = '1';
                    contentContainer.style.transform = 'translateY(0)';
                    contentContainer.style.height = 'auto';
                    contentContainer.style.maxHeight = 'none';
                    contentContainer.style.overflow = 'visible';
                    contentContainer.style.position = 'relative';
                    contentContainer.style.zIndex = '999';
                }, 10);
                
                expandIndicator.classList.add('expanded');
                card.classList.add('card-expanded');
                card.title = 'Clique novamente para recolher as opções';
                
            } else {
                // Animar para estado colapsado
                contentContainer.style.opacity = '0';
                contentContainer.style.transform = 'translateY(-10px)';
                
                // Após a animação, ocultar completamente  
                setTimeout(() => {
                    contentContainer.classList.remove('expanded');
                    contentContainer.style.display = 'none';
                    contentContainer.style.visibility = 'hidden';
                    contentContainer.style.height = '0';
                    contentContainer.style.overflow = 'hidden';
                }, 300); // Tempo da transição CSS
                
                expandIndicator.classList.remove('expanded');
                card.classList.remove('card-expanded');
                card.title = `${grandTotal} arquivos disponíveis - Clique para ver opções`;
            }
        });
        
        // Título inicial
        card.title = `${grandTotal} arquivos disponíveis - Clique para ver opções`;
    }

    updateFileCountDisplay(card, totalFiles) {
        // Removido: Não mostrar mais a contagem de arquivos
        // A informação de múltiplos arquivos já é indicada visualmente
        // através dos ícones de expansão e comportamento do card
    }

    createFileSection(files, sectionTitle, level) {
        const section = document.createElement('div');
        section.className = `file-section file-section-level-${level}`;
        
        if (sectionTitle) {
            const title = document.createElement('div');
            title.className = 'file-section-title';
            title.textContent = sectionTitle;
            section.appendChild(title);
        }
        
        files.forEach(filePath => {
            const fileOption = this.createFileOption(filePath, this.getFileType(filePath), level);
            section.appendChild(fileOption);
        });
        
        return section;
    }

    getFileType(filePath) {
        const fileName = filePath.toLowerCase();
        if (fileName.endsWith('.pdf')) return 'pdf';
        if (fileName.endsWith('.mp3') || fileName.endsWith('.wav') || 
            fileName.endsWith('.midi') || fileName.endsWith('.mid')) return 'audio';
        return 'other';
    }

    createMasterSection(sectionTitle, mainFiles, subfolders, fileType) {
        const section = document.createElement('div');
        section.className = 'master-file-section';
        
        // Título da seção principal
        const title = document.createElement('div');
        title.className = 'master-section-title';
        title.textContent = sectionTitle;
        section.appendChild(title);
        
        const content = document.createElement('div');
        content.className = 'master-section-content';
        
        // Adicionar subpastas que têm PDFs
        subfolders.forEach(subfolder => {
            const files = subfolder.pdfs;
            if (files && files.length > 0) {
                const subfolderElement = this.createCollapsibleSubfolder(subfolder, files, 'pdf');
                content.appendChild(subfolderElement);
            }
        });
        
        // Adicionar arquivos principais do nível raiz
        mainFiles.forEach(filePath => {
            const fileOption = this.createFileOption(filePath, 'pdf', 1);
            content.appendChild(fileOption);
        });
        
        section.appendChild(content);
        return section;
    }

    createCollapsibleSubfolder(subfolder, files, fileType) {
        const container = document.createElement('div');
        container.className = 'collapsible-subfolder';
        
        // Header clicável da subpasta
        const header = document.createElement('div');
        header.className = 'subfolder-header-clickable';
        
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'subfolder-toggle-icon';
        toggleIcon.textContent = '▶';
        
        const name = document.createElement('span');
        name.className = 'subfolder-name';
        name.textContent = subfolder.name || subfolder.nome;
        
        const fileCount = document.createElement('span');
        fileCount.className = 'subfolder-file-count';
        fileCount.textContent = `(${files.length})`;
        
        header.appendChild(toggleIcon);
        header.appendChild(name);
        header.appendChild(fileCount);
        
        // Conteúdo expansível
        const content = document.createElement('div');
        content.className = 'subfolder-expandable-content';
        content.style.display = 'none';
        
        files.forEach(filePath => {
            const fileOption = this.createFileOption(filePath, fileType, 2);
            content.appendChild(fileOption);
        });
        
        // Toggle functionality
        let isExpanded = false;
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                content.style.display = 'block';
                toggleIcon.textContent = '▼';
                toggleIcon.classList.add('expanded');
            } else {
                content.style.display = 'none';
                toggleIcon.textContent = '▶';
                toggleIcon.classList.remove('expanded');
            }
        });
        
        container.appendChild(header);
        container.appendChild(content);
        
        return container;
    }

    createSubfolderSection(subfolder, level) {
        const section = document.createElement('div');
        section.className = `subfolder-section subfolder-section-level-${level}`;
        
        // Cabeçalho da subpasta
        const header = document.createElement('div');
        header.className = 'subfolder-header';
        
        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'subfolder-toggle';
        toggleIcon.textContent = '▶';
        
        const title = document.createElement('span');
        title.className = 'subfolder-title';
        title.textContent = subfolder.name;
        
        const fileCount = document.createElement('span');
        fileCount.className = 'subfolder-file-count';
        fileCount.textContent = `(${subfolder.totalFiles})`;
        
        header.appendChild(toggleIcon);
        header.appendChild(title);
        header.appendChild(fileCount);
        
        // Container do conteúdo da subpasta
        const content = document.createElement('div');
        content.className = 'subfolder-content';
        
        // Adicionar PDFs da subpasta
        if (subfolder.pdfs && subfolder.pdfs.length > 0) {
            subfolder.pdfs.forEach(pdfPath => {
                const pdfOption = this.createFileOption(pdfPath, 'pdf', level + 1);
                content.appendChild(pdfOption);
            });
        }
        
        // Adicionar subpastas recursivamente
        if (subfolder.children && subfolder.children.length > 0) {
            subfolder.children.forEach(childSubfolder => {
                const childSection = this.createSubfolderSection(childSubfolder, level + 1);
                content.appendChild(childSection);
            });
        }
        
        section.appendChild(header);
        section.appendChild(content);
        
        // Toggle functionality para subpasta COM ACCORDION
        let isSubfolderExpanded = false;
        header.addEventListener('click', (e) => {
            e.stopPropagation();
            isSubfolderExpanded = !isSubfolderExpanded;
            
            if (isSubfolderExpanded) {
                // NOVO: Colapsar outras subpastas no mesmo nível
                const parentContainer = section.parentElement;
                if (parentContainer) {
                    this.collapseOtherSubfolders(content, parentContainer);
                }
                
                content.classList.add('expanded');
                toggleIcon.textContent = '▼';
                toggleIcon.classList.add('expanded');
            } else {
                content.classList.remove('expanded');
                toggleIcon.textContent = '▶';
                toggleIcon.classList.remove('expanded');
                
                // NOVO: Colapsar subpastas filhas recursivamente quando recolher
                this.collapseAllSubfolders(content);
            }
        });
        
        return section;
    }

    createFileOption(filePath, fileType, level) {
        const option = document.createElement('div');
        option.className = `file-option-item file-option-level-${level} file-type-${fileType}`;
        
        const icon = document.createElement('span');
        icon.className = 'file-option-icon';
        icon.textContent = fileType === 'pdf' ? this.getPdfIcon(filePath) : this.getAudioIcon(filePath);
        
        const name = document.createElement('span');
        name.className = 'file-option-name';
        name.textContent = fileType === 'pdf' ? this.getPdfDisplayName(filePath) : this.getAudioDisplayName(filePath);
        
        option.appendChild(icon);
        option.appendChild(name);
        
        // Click handler para abrir arquivo
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            window.open(filePath, '_blank');
        });
        
        return option;
    }

    getPdfIcon(pdfPath) {
        const fileName = pdfPath.toLowerCase();
        
        // Mapear ícones baseados no tipo de arquivo
        if (fileName.includes('grade')) return '🎼';
        if (fileName.includes('coro')) return '👥';
        if (fileName.includes('piano')) return '🎹';
        if (fileName.includes('vocal')) return '🎤';
        if (fileName.includes('violino')) return '🎻';
        if (fileName.includes('viola')) return '🎻';
        if (fileName.includes('cello')) return '🎻';
        if (fileName.includes('flauta')) return '🎺';
        if (fileName.includes('clarineta')) return '🎺';
        if (fileName.includes('sax')) return '🎷';
        if (fileName.includes('trompete')) return '🎺';
        if (fileName.includes('trombone')) return '🎺';
        
        return '📄'; // Ícone padrão
    }

    getPdfDisplayName(pdfPath) {
        // Extrair nome amigável do caminho do PDF
        const fileName = pdfPath.split('/').pop().replace('.pdf', '');
        
        // Mapear nomes comuns para versões mais amigáveis
        const nameMap = {
            'Grade': 'Grade Completa',
            'Coro': 'Coro',
            'Piano': 'Piano',
            'Vocal': 'Vocal',
            'Vocal e Piano': 'Vocal + Piano',
            'Coro e Piano': 'Coro + Piano'
        };

        // Procurar padrões conhecidos no nome
        for (const [pattern, display] of Object.entries(nameMap)) {
            if (fileName.includes(pattern)) {
                return display;
            }
        }

        // Detectar instrumentos com variações mais específicas
        // Procurar por padrões completos primeiro (com números e variações)
        const fullInstrumentPatterns = [
            // Violinos
            { pattern: /Violino\s*1\s*(?:º)?/i, display: 'Violino 1º' },
            { pattern: /Violino\s*2\s*(?:º)?/i, display: 'Violino 2º' },
            { pattern: /Violino\s*I\b/i, display: 'Violino 1º' },
            { pattern: /Violino\s*II\b/i, display: 'Violino 2º' },
            
            // Flautas
            { pattern: /Flauta\s*1\s*(?:º)?/i, display: 'Flauta 1º' },
            { pattern: /Flauta\s*2\s*(?:º)?/i, display: 'Flauta 2º' },
            { pattern: /Flauta\s*1\s*[,e]\s*2/i, display: 'Flauta 1º e 2º' },
            
            // Saxofones
            { pattern: /Sax\s*Tenor/i, display: 'Sax Tenor' },
            { pattern: /Sax\s*Alto/i, display: 'Sax Alto' },
            { pattern: /Sax\s*Soprano/i, display: 'Sax Soprano' },
            { pattern: /Sax\s*Barítono/i, display: 'Sax Barítono' },
            
            // Trombones
            { pattern: /Trombone\s*1\s*(?:º)?/i, display: 'Trombone 1º' },
            { pattern: /Trombone\s*2\s*(?:º)?/i, display: 'Trombone 2º' },
            { pattern: /Trombone\s*Tenor/i, display: 'Trombone Tenor' },
            { pattern: /Trombone\s*Baixo/i, display: 'Trombone Baixo' },
            
            // Trompetes
            { pattern: /Trompete\s*1\s*(?:º)?/i, display: 'Trompete 1º' },
            { pattern: /Trompete\s*2\s*(?:º)?/i, display: 'Trompete 2º' },
            { pattern: /Trompete\s*Sib/i, display: 'Trompete Sib' },
            
            // Clarinetas
            { pattern: /Clarineta\s*1\s*(?:º)?/i, display: 'Clarineta 1º' },
            { pattern: /Clarineta\s*2\s*(?:º)?/i, display: 'Clarineta 2º' },
            { pattern: /Clarineta\s*Sib/i, display: 'Clarineta Sib' },
            
            // Outros instrumentos com variações
            { pattern: /Viola\s*1\s*(?:º)?/i, display: 'Viola 1º' },
            { pattern: /Viola\s*2\s*(?:º)?/i, display: 'Viola 2º' },
            { pattern: /Cello\s*1\s*(?:º)?/i, display: 'Cello 1º' },
            { pattern: /Cello\s*2\s*(?:º)?/i, display: 'Cello 2º' },
            
            // Vozes
            { pattern: /Soprano/i, display: 'Soprano' },
            { pattern: /Contralto/i, display: 'Contralto' },
            { pattern: /Tenor/i, display: 'Tenor' },
            { pattern: /Baixo/i, display: 'Baixo' },
            { pattern: /Barítono/i, display: 'Barítono' }
        ];

        // Procurar por padrões específicos primeiro
        for (const { pattern, display } of fullInstrumentPatterns) {
            if (pattern.test(fileName)) {
                return display;
            }
        }

        // Detectar instrumentos básicos (sem variações)
        const basicInstruments = {
            'Violino': 'Violino', 'Viola': 'Viola', 'Cello': 'Cello', 'Contrabaixo': 'Contrabaixo',
            'Flauta': 'Flauta', 'Clarineta': 'Clarineta', 'Sax': 'Saxofone',
            'Trompete': 'Trompete', 'Trombone': 'Trombone', 'Tuba': 'Tuba',
            'Oboé': 'Oboé', 'Fagote': 'Fagote', 'Trompa': 'Trompa'
        };

        for (const [instrument, display] of Object.entries(basicInstruments)) {
            if (fileName.includes(instrument)) {
                return display;
            }
        }

        // Retornar nome limpo como fallback
        return fileName.replace(/^.*? - /, ''); // Removes prefixes like "Louvor 001 - "
    }

    formatClassificacao(classificacao) {
        // Convert ClassificacaoPipe logic to JavaScript
        const classificacaoMap = {
            'ColAdultos': 'Coletânea de Adultos',
            'ColCIAs': 'Coletânea de CIAs',
            'Avulsos': 'Avulsos'
        };
        return classificacaoMap[classificacao] || classificacao;
    }

    formatStatus(status) {
        const statusMap = {
            'V': 'Completo',
            'A': 'Incompleto',
            'P': 'Ausente'
        };
        return statusMap[status] || status;
    }

    getPdfPath(louvor) {
        // Para a nova estrutura, usar o primeiro PDF disponível
        if (louvor.pdfs && louvor.pdfs.length > 0) {
            return louvor.pdfs[0];
        }
        
        // Fallback para compatibilidade com estrutura antiga
        if (louvor.pdf) {
            const folder = this.pdfMapper(louvor.classificacao);
            return `assets/${folder}${louvor.pdf}`;
        }

        return null;
    }

    pdfMapper(v) {
        const dic = {
            'ColAdultos': 'ColAdultos/',
            'ColCIAs': 'ColCIAs/',
        }

        if (dic[v]) return dic[v];
        return 'Avulsos/'
    }

    getAudioIcon(audioPath) {
        const extension = audioPath.split('.').pop().toLowerCase();
        switch (extension) {
            case 'mp3':
            case 'wav':
            case 'm4a':
            case 'aac':
            case 'ogg':
                return '🎵';
            case 'mid':
            case 'midi':
                return '🎹';
            default:
                return '🔊';
        }
    }

    getAudioDisplayName(audioPath) {
        const fileName = audioPath.split('/').pop();
        return fileName.replace(/\.[^/.]+$/, ''); // Remove extensão
    }

    setupSubfoldersView(card, louvor) {
        // Caso especial: só há subpastas, não PDFs no nível principal
        card.setAttribute('data-subfolders-only', 'true');
        card.style.cursor = 'pointer';
        
        const totalFiles = louvor.subfolders.reduce((total, subfolder) => total + subfolder.totalFiles, 0);
        this.updateFileCountDisplay(card, totalFiles);
        
        // Criar container para subpastas
        const contentContainer = document.createElement('div');
        contentContainer.className = 'file-options-container';
        
        louvor.subfolders.forEach(subfolder => {
            const subfolderElement = this.createSubfolderSection(subfolder, 0);
            contentContainer.appendChild(subfolderElement);
        });
        
        // Adicionar indicador de expansão
        const expandIndicator = document.createElement('span');
        expandIndicator.className = 'expand-indicator';
        expandIndicator.textContent = '▼';
        
        const header = card.querySelector('.search-option-louvor-header');
        if (header) {
            header.appendChild(expandIndicator);
        }
        
        card.appendChild(contentContainer);
        
        // Toggle functionality COM ACCORDION
        let isExpanded = false;
        card.addEventListener('click', (e) => {
            if (e.target.closest('.file-option-item') || e.target.closest('.subfolder-toggle')) {
                return;
            }
            
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                // NOVO: Colapsar todos os outros cards antes de expandir este
                this.collapseAllOtherCards(card);
                
                contentContainer.classList.add('expanded');
                expandIndicator.classList.add('expanded');
                card.classList.add('card-expanded');  // Adicionar classe para altura dinâmica
                card.title = 'Clique novamente para recolher as pastas';
            } else {
                contentContainer.classList.remove('expanded');
                expandIndicator.classList.remove('expanded');
                card.classList.remove('card-expanded');  // Remover classe para altura dinâmica
                
                // NOVO: Colapsar todas as subpastas quando recolher o card
                this.collapseAllSubfolders(card);
                
                card.title = `${totalFiles} arquivos em ${louvor.subfolders.length} pastas - Clique para ver`;
            }
        });
        
        card.title = `${totalFiles} arquivos em ${louvor.subfolders.length} pastas - Clique para ver`;
    }

    setupMultiplePdfsView(card, louvor) {
        card.setAttribute('data-multiple-pdfs', 'true');
        card.setAttribute('data-pdf-count', louvor.pdfs.length);
        card.style.cursor = 'pointer';
        
        // Criar container para as opções de PDF
        const pdfContainer = document.createElement('div');
        pdfContainer.className = 'pdf-options-list';
        
        // Criar cada opção de PDF
        louvor.pdfs.forEach((pdfPath, index) => {
            const pdfOption = document.createElement('div');
            pdfOption.className = 'pdf-option-item';
            
            const icon = document.createElement('span');
            icon.className = 'pdf-option-icon';
            icon.textContent = this.getPdfIcon(pdfPath);
            
            const name = document.createElement('span');
            name.className = 'pdf-option-name';
            name.textContent = this.getPdfDisplayName(pdfPath);
            
            pdfOption.appendChild(icon);
            pdfOption.appendChild(name);
            
            // Click handler para abrir PDF
            pdfOption.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar que dispare o toggle do card
                window.open(pdfPath, '_blank');
            });
            
            pdfContainer.appendChild(pdfOption);
        });
        
        // Adicionar indicador de expansão ao card
        const expandIndicator = document.createElement('span');
        expandIndicator.className = 'expand-indicator';
        expandIndicator.textContent = '▼';
        
        // Encontrar o header e adicionar o indicador
        const header = card.querySelector('.search-option-louvor-header');
        if (header) {
            header.appendChild(expandIndicator);
        }
        
        // Adicionar container ao card
        card.appendChild(pdfContainer);
        
        // Estado de expansão
        let isExpanded = false;
        
        // Click handler para toggle do collapse COM ACCORDION
        card.addEventListener('click', (e) => {
            // Se clicou numa opção de PDF, não fazer toggle
            if (e.target.closest('.pdf-option-item')) {
                return;
            }
            
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                // NOVO: Colapsar todos os outros cards antes de expandir este
                this.collapseAllOtherCards(card);
                
                pdfContainer.classList.add('expanded');
                expandIndicator.classList.add('expanded');
                card.classList.add('card-expanded');  // Adicionar classe para altura dinâmica
                card.title = 'Clique novamente para recolher as opções';
            } else {
                pdfContainer.classList.remove('expanded');
                expandIndicator.classList.remove('expanded');
                card.classList.remove('card-expanded');  // Remover classe para altura dinâmica
                card.title = `${louvor.pdfs.length} PDFs disponíveis - Clique para ver opções`;
            }
        });
        
        // Título inicial
        card.title = `${louvor.pdfs.length} PDFs disponíveis - Clique para ver opções`;
    }

    // Sistema de Accordion - garantir que apenas um card/subpasta esteja expandido
    collapseAllOtherCards(excludeCard = null) {
        // Encontrar todos os cards no container de resultados
        const allCards = document.querySelectorAll('.search-option-louvor-card');
        
        allCards.forEach(card => {
            if (card === excludeCard) return; // Não colapsar o card atual
            
            // Colapsar o card e todas suas subpastas recursivamente
            this.collapseCardAndChildren(card);
        });
    }

    collapseCardAndChildren(card) {
        // Colapsar container principal do card
        const container = card.querySelector('.file-options-container');
        const indicator = card.querySelector('.expand-indicator');
        
        if (container && container.classList.contains('expanded')) {
            container.classList.remove('expanded');
            if (indicator) {
                indicator.classList.remove('expanded');
            }
        }
        
        // Remover classe de altura dinâmica
        card.classList.remove('card-expanded');
        
        // Colapsar todas as subpastas dentro do card recursivamente
        this.collapseAllSubfolders(card);
    }

    collapseAllSubfolders(parentElement) {
        const subfolders = parentElement.querySelectorAll('.subfolder-content.expanded');
        subfolders.forEach(subfolder => {
            subfolder.classList.remove('expanded');
            
            // Encontrar e resetar o ícone da subpasta
            const header = subfolder.previousElementSibling;
            if (header && header.classList.contains('subfolder-header')) {
                const toggle = header.querySelector('.subfolder-toggle');
                if (toggle) {
                    toggle.textContent = '▶';
                    toggle.classList.remove('expanded');
                }
            }
        });
    }

    collapseOtherSubfolders(currentSubfolder, parentContainer) {
        // Encontrar todas as subpastas no mesmo nível dentro do mesmo container
        const siblingSubfolders = parentContainer.querySelectorAll('.subfolder-content');
        
        siblingSubfolders.forEach(subfolder => {
            if (subfolder === currentSubfolder) return; // Não colapsar a subpasta atual
            
            if (subfolder.classList.contains('expanded')) {
                subfolder.classList.remove('expanded');
                
                // Resetar o ícone
                const header = subfolder.previousElementSibling;
                if (header && header.classList.contains('subfolder-header')) {
                    const toggle = header.querySelector('.subfolder-toggle');
                    if (toggle) {
                        toggle.textContent = '▶';
                        toggle.classList.remove('expanded');
                    }
                }
                
                // Colapsar subpastas filhas recursivamente
                this.collapseAllSubfolders(subfolder);
            }
        });
    }

    // Funções utilitárias para coleção
    extractColecaoFromPath(caminhoCompleto) {
        if (!caminhoCompleto) return null;
        
        // Padrão: "assets2/NOME_DA_COLECAO/pasta_do_louvor"
        const parts = caminhoCompleto.split('/');
        if (parts.length >= 2 && parts[0] === 'assets2') {
            return parts[1]; // Retorna o nome da pasta logo após assets2/
        }
        
        return null;
    }

    formatColecao(nomeColecao) {
        // Mapear nomes de pastas para nomes mais amigáveis
        const mapeamento = {
            'Louvores Coletânea de Partituras': '📚 Coletânea de Partituras',
            'Louvores Avulsos (Diversos)': '📄 Avulsos Diversos',
            'Louvores Avulsos (PES)': '📄 Avulsos PES', 
            'Louvores Avulsos CIAs (Crianças, Intermediário, Adolescente)': '👶 CIAs',
            // Mapeamentos adicionais conforme necessário
        };
        
        return mapeamento[nomeColecao] || `📂 ${nomeColecao}`;
    }

}

// Expor classe no window para verificação de carregamento
window.SearchOptionComponent = SearchOptionComponent;
