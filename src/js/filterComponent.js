// Filter Component Logic
class FilterComponent {
    constructor() {
        this.filters = {
            content: {
                todos: true,
                coro: true,
                grade: true,
                sopros: true,
                cordas: true
            }
        };
        
        this.init();
        this.loadFiltersFromStorage();
    }

    init() {
        this.injectFiltersHTML();
        this.bindEvents();
    }

    injectFiltersHTML() {
        // Tentar encontrar o container apropriado
        let targetContainer = document.querySelector('.search-container');
        
        // Se não encontrar .search-container, tentar outros containers
        if (!targetContainer) {
            targetContainer = document.querySelector('.code-results-container');
        }
        
        // Se ainda não encontrar, criar um container temporário
        if (!targetContainer) {
            targetContainer = document.querySelector('main') || document.body;
        }
        
        if (!targetContainer) {
            console.error('Nenhum container encontrado para filtros');
            return;
        }

        // Verificar se os filtros já foram injetados em qualquer lugar
        if (document.querySelector('.filters-container')) {
            return;
        }

        const filtersHTML = `
            <div class="filters-container">
                <div class="filters-row">
                    <!-- Filtro de Conteúdo - Desktop -->
                    <div class="filter-section content-filter-desktop">
                        <span class="filter-section-title">
                            Conteúdo:
                            <span class="filter-info-icon" title="Filtro com imprecisão! Melhoria em breve.">ⓘ</span>
                        </span>
                        <div class="filter-checkbox-group">
                            <label class="filter-checkbox-item">
                                <input type="checkbox" id="filter-todos" checked />
                                <span>Todos</span>
                            </label>
                            <label class="filter-checkbox-item">
                                <input type="checkbox" id="filter-coro" checked />
                                <span>Coro</span>
                            </label>
                            <label class="filter-checkbox-item">
                                <input type="checkbox" id="filter-grade" checked />
                                <span>Grade</span>
                            </label>
                            <label class="filter-checkbox-item">
                                <input type="checkbox" id="filter-sopros" checked />
                                <span>Sopros</span>
                            </label>
                            <label class="filter-checkbox-item">
                                <input type="checkbox" id="filter-cordas" checked />
                                <span>Cordas</span>
                            </label>
                        </div>
                    </div>

                    <!-- Filtro de Conteúdo - Mobile -->
                    <div class="filter-section content-filter-mobile">
                        <span class="filter-section-title">
                            Conteúdo:
                            <span class="filter-info-icon" title="Filtro com imprecisão! Melhoria em breve.">ⓘ</span>
                        </span>
                        <div class="content-filter-select">
                            <div class="content-filter-button" id="content-filter-button">
                                <span id="content-filter-text">Todos selecionados</span>
                                <span class="dropdown-arrow">▼</span>
                            </div>
                            <div class="content-filter-dropdown" id="content-filter-dropdown">
                                <label class="content-filter-option">
                                    <input type="checkbox" id="filter-todos-mobile" checked />
                                    <span>Todos</span>
                                </label>
                                <label class="content-filter-option">
                                    <input type="checkbox" id="filter-coro-mobile" checked />
                                    <span>Coro (vozes, melodia)</span>
                                </label>
                                <label class="content-filter-option">
                                    <input type="checkbox" id="filter-grade-mobile" checked />
                                    <span>Grade (partitura completa)</span>
                                </label>
                                <label class="content-filter-option">
                                    <input type="checkbox" id="filter-sopros-mobile" checked />
                                    <span>Sopros (sax, flauta, etc.)</span>
                                </label>
                                <label class="content-filter-option">
                                    <input type="checkbox" id="filter-cordas-mobile" checked />
                                    <span>Cordas (violino, viola, etc.)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        targetContainer.insertAdjacentHTML('beforeend', filtersHTML);
    }

    bindEvents() {
        // Desktop Content Filters
        const contentFilters = ['todos', 'coro', 'grade', 'sopros', 'cordas'];
        
        // Evento especial para "Todos"
        const todosCheckbox = document.getElementById('filter-todos');
        if (todosCheckbox) {
            todosCheckbox.addEventListener('change', () => {
                this.filters.content.todos = todosCheckbox.checked;
                
                // Marcar/desmarcar todos os outros filtros
                const otherFilters = ['coro', 'grade', 'sopros', 'cordas'];
                otherFilters.forEach(type => {
                    this.filters.content[type] = todosCheckbox.checked;
                    
                    // Sincronizar checkboxes desktop
                    const checkbox = document.getElementById(`filter-${type}`);
                    if (checkbox) {
                        checkbox.checked = todosCheckbox.checked;
                    }
                    
                    // Sincronizar checkboxes mobile
                    const mobileCheckbox = document.getElementById(`filter-${type}-mobile`);
                    if (mobileCheckbox) {
                        mobileCheckbox.checked = todosCheckbox.checked;
                    }
                });
                
                this.updateMobileFilterText();
                this.saveFiltersToStorage();
                this.applyFilters();
            });
        }
        
        // Eventos para filtros individuais (exceto "todos")
        const individualFilters = ['coro', 'grade', 'sopros', 'cordas'];
        individualFilters.forEach(type => {
            const checkbox = document.getElementById(`filter-${type}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.filters.content[type] = checkbox.checked;
                    
                    // Atualizar estado do "Todos" baseado nos outros filtros
                    this.updateTodosState();
                    
                    this.saveFiltersToStorage();
                    this.applyFilters();
                });
            } else {
                console.error(`Elemento filter-${type} não encontrado`);
            }
        });

        // Mobile Content Filters
        const allMobileFilters = ['todos', 'coro', 'grade', 'sopros', 'cordas'];
        
        // Evento especial para "Todos" mobile
        const todosMobileCheckbox = document.getElementById('filter-todos-mobile');
        if (todosMobileCheckbox) {
            todosMobileCheckbox.addEventListener('change', () => {
                this.filters.content.todos = todosMobileCheckbox.checked;
                
                // Sincronizar com desktop
                const desktopTodosCheckbox = document.getElementById('filter-todos');
                if (desktopTodosCheckbox) {
                    desktopTodosCheckbox.checked = todosMobileCheckbox.checked;
                }
                
                // Marcar/desmarcar todos os outros filtros
                const otherFilters = ['coro', 'grade', 'sopros', 'cordas'];
                otherFilters.forEach(type => {
                    this.filters.content[type] = todosMobileCheckbox.checked;
                    
                    // Sincronizar checkboxes desktop
                    const desktopCheckbox = document.getElementById(`filter-${type}`);
                    if (desktopCheckbox) {
                        desktopCheckbox.checked = todosMobileCheckbox.checked;
                    }
                    
                    // Sincronizar checkboxes mobile
                    const mobileCheckbox = document.getElementById(`filter-${type}-mobile`);
                    if (mobileCheckbox) {
                        mobileCheckbox.checked = todosMobileCheckbox.checked;
                    }
                });
                
                this.updateMobileFilterText();
                this.saveFiltersToStorage();
                this.applyFilters();
            });
        }
        
        // Eventos para filtros individuais mobile (exceto "todos")
        individualFilters.forEach(type => {
            const checkbox = document.getElementById(`filter-${type}-mobile`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.filters.content[type] = checkbox.checked;
                    
                    // Sync with desktop version
                    const desktopCheckbox = document.getElementById(`filter-${type}`);
                    if (desktopCheckbox) {
                        desktopCheckbox.checked = checkbox.checked;
                    }
                    
                    // Atualizar estado do "Todos" baseado nos outros filtros
                    this.updateTodosState();
                    
                    this.updateMobileFilterText();
                    this.saveFiltersToStorage();
                    this.applyFilters();
                });
            }
        });

        // Mobile Dropdown Toggle
        const dropdownButton = document.getElementById('content-filter-button');
        const dropdown = document.getElementById('content-filter-dropdown');
        const arrow = dropdownButton?.querySelector('.dropdown-arrow');

        if (dropdownButton && dropdown) {
            dropdownButton.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = dropdown.classList.contains('show');
                
                if (isOpen) {
                    dropdown.classList.remove('show');
                    arrow?.classList.remove('rotate');
                } else {
                    dropdown.classList.add('show');
                    arrow?.classList.add('rotate');
                    
                    // Garantir que o dropdown esteja na tela
                    this.ensureDropdownInView(dropdown);
                }
            });

            // Fechar dropdown ao clicar fora
            document.addEventListener('click', (e) => {
                if (!dropdownButton.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                    arrow?.classList.remove('rotate');
                }
            });
        }
    }

    ensureDropdownInView(dropdown) {
        // Garantir que o dropdown sempre esteja 100% na tela
        setTimeout(() => {
            const rect = dropdown.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;

            // Ajustar verticalmente
            if (rect.bottom > viewportHeight) {
                dropdown.style.bottom = '100%';
                dropdown.style.top = 'auto';
                dropdown.style.borderRadius = '6px 6px 0 0';
            } else {
                dropdown.style.top = '100%';
                dropdown.style.bottom = 'auto';
                dropdown.style.borderRadius = '0 0 6px 6px';
            }

            // Ajustar horizontalmente
            if (rect.right > viewportWidth) {
                dropdown.style.right = '0';
                dropdown.style.left = 'auto';
            } else {
                dropdown.style.left = '0';
                dropdown.style.right = 'auto';
            }
        }, 10);
    }

    updateMobileFilterText() {
        // Excluir "todos" da contagem
        const individualFilters = ['coro', 'grade', 'sopros', 'cordas'];
        const selectedCount = individualFilters.filter(type => this.filters.content[type]).length;
        const totalCount = individualFilters.length;
        const textElement = document.getElementById('content-filter-text');
        
        if (textElement) {
            if (selectedCount === totalCount) {
                textElement.textContent = 'Todos selecionados';
            } else if (selectedCount === 0) {
                textElement.textContent = 'Nenhum selecionado';
            } else {
                textElement.textContent = `${selectedCount} de ${totalCount}`;
            }
        }
    }

    updateTodosState() {
        // Verificar se todos os filtros individuais estão marcados
        const individualFilters = ['coro', 'grade', 'sopros', 'cordas'];
        const allSelected = individualFilters.every(type => this.filters.content[type]);
        const noneSelected = individualFilters.every(type => !this.filters.content[type]);
        
        // Atualizar o estado de "todos"
        this.filters.content.todos = allSelected;
        
        // Sincronizar checkboxes "todos" desktop e mobile
        const todosDesktop = document.getElementById('filter-todos');
        const todosMobile = document.getElementById('filter-todos-mobile');
        
        if (todosDesktop) {
            todosDesktop.checked = allSelected;
            todosDesktop.indeterminate = !allSelected && !noneSelected;
        }
        
        if (todosMobile) {
            todosMobile.checked = allSelected;
            todosMobile.indeterminate = !allSelected && !noneSelected;
        }
        
        this.updateMobileFilterText();
    }

    loadFiltersFromStorage() {
        try {
            const savedFilters = localStorage.getItem('pesquisador-filters');
            if (savedFilters) {
                const parsed = JSON.parse(savedFilters);
                this.filters = { ...this.filters, ...parsed };
                this.syncUIWithFilters();
            }
        } catch (error) {
            console.error('Erro ao carregar filtros do localStorage:', error);
        }
    }

    saveFiltersToStorage() {
        try {
            localStorage.setItem('pesquisador-filters', JSON.stringify(this.filters));
        } catch (error) {
            console.error('Erro ao salvar filtros no localStorage:', error);
        }
    }

    syncUIWithFilters() {
        // Content Filters - Desktop
        Object.keys(this.filters.content).forEach(type => {
            const checkbox = document.getElementById(`filter-${type}`);
            if (checkbox) {
                checkbox.checked = this.filters.content[type];
            }
        });

        // Content Filters - Mobile
        Object.keys(this.filters.content).forEach(type => {
            const checkbox = document.getElementById(`filter-${type}-mobile`);
            if (checkbox) {
                checkbox.checked = this.filters.content[type];
            }
        });

        this.updateMobileFilterText();
    }

    applyFilters() {
        // Aplicar filtros no modo pesquisa
        if (window.searchOptionsComponent && window.searchOptionsComponent.lastResults) {
            if (window.searchOptionsComponent.lastResults.length > 0) {
                // NÃO filtrar os louvores - mostrar todos os resultados da busca
                // A filtragem acontecerá no conteúdo de cada louvor
                window.searchOptionsComponent.displayResults(window.searchOptionsComponent.lastResults, false);
            }
        }
        
        // Aplicar filtros no modo código
        if (window.urlCodeManager && window.urlCodeManager.isCodeMode) {
            window.urlCodeManager.applyCodeFilters();
        }
    }

    // Função para filtrar arquivos baseado nos filtros de conteúdo
    filterFiles(files, fileType = 'pdfs') {
        if (!files || files.length === 0) return [];
        
        console.log(`🔍 filterFiles (${fileType}) chamado:`, {
            totalArquivos: files.length,
            arquivos: files.map(p => p.split('/').pop()),
            filtrosConteudo: this.filters.content
        });
        
        // Aplicar filtros de conteúdo apenas nos PDFs
        const individualFilters = ['coro', 'grade', 'sopros', 'cordas'];
        const anyContentFilterActive = individualFilters.some(type => this.filters.content[type]);
        console.log('🎯 Algum filtro de conteúdo ativo?', anyContentFilterActive);
        console.log('📝 Estado atual dos filtros:', this.filters.content);
        
        // Se "Todos" está marcado, pular verificação de filtros individuais
        const shouldApplyContentFilters = !this.filters.content.todos;
        console.log('🎛️ Deve aplicar filtros de conteúdo?', shouldApplyContentFilters);
        
        if (shouldApplyContentFilters && !anyContentFilterActive) {
            console.log('❌ Nenhum filtro de conteúdo ativo, retornando array vazio');
            return [];
        }
        
        const result = files.filter(filePath => {
            const fileName = filePath.toLowerCase();
            
            // Para PDFs, aplicar lógica de filtros
            if (fileName.endsWith('.pdf')) {
                // Se "Todos" está marcado, mostrar TODOS os PDFs
                if (this.filters.content.todos) {
                    console.log('✅ PDF mantido (Todos marcado):', fileName.split('/').pop());
                    return true;
                }
                
                // Se "Todos" não está marcado, verificar filtros específicos
                const contentType = this.classifyContent(filePath);
                console.log('📄 PDF analisado:', fileName.split('/').pop(), '→', contentType, 'permitido:', this.filters.content[contentType]);
                
                // Se o conteúdo foi classificado como "outros", aceitar se algum filtro individual estiver ativo
                if (contentType === 'outros') {
                    return anyContentFilterActive;
                }
                
                // Para tipos específicos, verificar se o filtro está ativo
                return this.filters.content[contentType];
            }
            
            // Para arquivos não-PDF, sempre mostrar (áudios, etc.)
            console.log('🎵 Arquivo não-PDF mantido:', fileName.split('/').pop());
            return true;
        });
        
        console.log('✅ Resultado final:', result.length, 'de', files.length, 'arquivos');
        return result;
    }

    // Função de compatibilidade - redireciona para filterFiles
    filterPdfs(pdfs) {
        return this.filterFiles(pdfs, 'pdfs');
    }

    // Nova função para filtrar áudios
    filterAudios(audios) {
        return this.filterFiles(audios, 'audios');
    }

    // Nova função para filtrar subpastas considerando PDFs E áudios
    filterSubfolders(subfolders) {
        if (!subfolders || subfolders.length === 0) return [];
        
        console.log('� filterSubfolders chamado:', {
            totalSubpastas: subfolders.length,
            nomes: subfolders.map(s => s.name || s.nome)
        });
        
        return subfolders.map(subfolder => {
            console.log(`\n� Processando subpasta: ${subfolder.name || subfolder.nome}`);
            console.log('   PDFs originais:', subfolder.pdfs?.length || 0);
            console.log('   Áudios originais:', subfolder.audios?.length || 0);
            
            const filteredPdfs = this.filterFiles(subfolder.pdfs || [], 'pdfs');
            const filteredAudios = this.filterFiles(subfolder.audios || [], 'audios');
            
            console.log('   PDFs filtrados:', filteredPdfs.length);
            console.log('   Áudios filtrados:', filteredAudios.length);
            
            return {
                ...subfolder,
                pdfs: filteredPdfs,
                audios: filteredAudios
            };
        }).filter(subfolder => {
            // Manter subpasta apenas se tiver pelo menos um arquivo (PDF ou áudio)
            const hasContent = (subfolder.pdfs && subfolder.pdfs.length > 0) || 
                             (subfolder.audios && subfolder.audios.length > 0);
            
            if (!hasContent) {
                console.log(`❌ Subpasta ${subfolder.name || subfolder.nome} removida (sem conteúdo após filtros)`);
            } else {
                console.log(`✅ Subpasta ${subfolder.name || subfolder.nome} mantida (${subfolder.pdfs?.length || 0} PDFs + ${subfolder.audios?.length || 0} áudios)`);
            }
            
            return hasContent;
        });
    }

    // Função para verificar se um louvor deve mostrar conteúdo
    shouldShowContent(louvor) {
        // Verificar se há conteúdo que passa nos filtros
        const hasValidPdfs = this.filterPdfs(louvor.pdfs || []).length > 0;
        const hasValidSubfolders = this.filterSubfolders(louvor.subfolders || []).length > 0;
        
        return hasValidPdfs || hasValidSubfolders;
    }

    filterResults(results) {
        // REMOVER ESTA FUNÇÃO - não filtrar mais os louvores
        // Retornar todos os resultados sempre
        return results;
    }

    classifyContent(pdfPath) {
        if (!pdfPath) return 'outros';
        
        const fileName = pdfPath.toLowerCase();
        
        // Classificar Grade (deve vir primeiro pois é mais específico)
        if (fileName.includes('grade') || fileName.includes('partitura completa') || 
            fileName.includes('(grade)') || fileName.includes('full score')) {
            return 'grade';
        }

        // Classificar Sopros (DEVE VIR ANTES DE CORO para capturar "sax tenor", "tenor sax", etc.)
        if (fileName.includes('sax') || fileName.includes('saxophone') ||
            fileName.includes('flauta') || fileName.includes('flute') ||
            fileName.includes('clarineta') || fileName.includes('clarinete') || fileName.includes('clarinet') ||
            fileName.includes('trombone') || fileName.includes('trompete') || fileName.includes('trumpet') ||
            fileName.includes('tuba') || fileName.includes('oboé') || fileName.includes('oboe') ||
            fileName.includes('fagote') || fileName.includes('bassoon') ||
            fileName.includes('trompa') || fileName.includes('horn') ||
            fileName.includes('bombardino') || fileName.includes('eufônio') || fileName.includes('euphonium') ||
            fileName.includes('sopro') || fileName.includes('wind') ||
            // Casos específicos de instrumentos com nomes que podem confundir
            fileName.includes('sax tenor') || fileName.includes('tenor sax') ||
            fileName.includes('sax alto') || fileName.includes('alto sax') ||
            fileName.includes('sax soprano') || fileName.includes('soprano sax') ||
            fileName.includes('sax barítono') || fileName.includes('barítono sax')) {
            return 'sopros';
        }

        // Classificar Coro (vozes, melodia, áudio geral) - DEPOIS de sopros
        if (fileName.includes('coro') || fileName.includes('choir') ||
            fileName.includes('vocal') || fileName.includes('voz') ||
            fileName.includes('melodia') || fileName.includes('melody') ||
            // Vozes específicas (só se não for instrumento)
            (fileName.includes('soprano') && !fileName.includes('sax')) ||
            (fileName.includes('contralto') && !fileName.includes('sax')) || 
            (fileName.includes('tenor') && !fileName.includes('sax') && !fileName.includes('tenor sax')) ||
            (fileName.includes('baixo') && !fileName.includes('contrabaixo') && !fileName.includes('baixo elétrico'))) {
            return 'coro';
        }

        // Classificar Cordas
        if (fileName.includes('violino') || fileName.includes('violin') ||
            fileName.includes('viola') && !fileName.includes('violão') ||
            fileName.includes('cello') || fileName.includes('violoncelo') ||
            fileName.includes('contrabaixo') || fileName.includes('double bass') ||
            fileName.includes('baixo elétrico') || fileName.includes('bass') ||
            fileName.includes('cordas') || fileName.includes('string')) {
            return 'cordas';
        }

        // Outros (piano, cifra, bateria, etc.)
        return 'outros';
    }

    // Método público para resetar filtros
    resetFilters() {
        this.filters = {
            content: {
                todos: true,
                coro: true,
                grade: true,
                sopros: true,
                cordas: true
            }
        };
        this.syncUIWithFilters();
        this.saveFiltersToStorage();
        this.applyFilters();
    }

    // Método para debug - limpar localStorage
    clearStorage() {
        localStorage.removeItem('pesquisador-filters');
        console.log('✅ localStorage limpo - recarregue a página');
    }

    // Método para debug - mostrar estado atual
    debugFilters() {
        console.log('🔍 Estado atual dos filtros:', {
            pdfOnly: this.filters.pdfOnly,
            content: this.filters.content
        });
        
        // Testar com um arquivo exemplo
        const testFiles = [
            'teste/Coro.pdf',
            'teste/Grade.pdf', 
            'teste/Áudio geral.mp3',
            'teste/Sopros - Sax tenor.pdf'
        ];
        
        console.log('🧪 Teste com arquivos exemplo:');
        testFiles.forEach(file => {
            const result = this.filterFiles([file], 'test');
            console.log(`   ${file} → ${result.length > 0 ? '✅ PASSA' : '❌ FILTRADO'}`);
        });
    }
}

// Criar instância global
window.filterComponent = null;

// Não inicializar automaticamente aqui - será feito via initializeComponents.js
