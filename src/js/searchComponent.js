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
        // Clear results
        searchOptionsComponent.clearResults();
    }

    handleSearch() {
        if (!this.hasValue) return;

        const results = this.performSearch(this.searchText);
        searchOptionsComponent.displayResults(results);
    }

    performSearch(searchText) {
        if (!window.louvores) {
            console.log('TODO: louvores data not available');
            return [];
        }

        const normalizedSearch = this.normalizeSearchString(searchText);
        const isNumericSearch = /^\d+$/.test(searchText.trim());

        return window.louvores.filter(louvor => {
            if (isNumericSearch) {
                return louvor["numero"].toString() === searchText.trim();
            } else {
                const normalizedName = this.normalizeSearchString(louvor["nome"]);
                return normalizedName.includes(normalizedSearch);
            }
        });
    }

    normalizeSearchString(str) {
        return str.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\w\s]/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
}
