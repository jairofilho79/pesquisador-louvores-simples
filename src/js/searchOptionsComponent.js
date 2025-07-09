// Search Options Component Logic
class SearchOptionsComponent {
    constructor() {
        this.container = document.querySelector('.search-options-container');
    }

    displayResults(results) {
        this.clearResults();

        if (results.length === 0) {
            this.container.innerHTML = '<p style="text-align: center; color: #fff; font-size: 1.2rem;">Nenhum resultado encontrado</p>';
            return;
        }

        results.forEach(louvor => {
            const searchOptionElement = searchOptionComponent.createSearchOption(louvor);
            this.container.appendChild(searchOptionElement);
        });
    }

    clearResults() {
        this.container.innerHTML = '';
    }
}
