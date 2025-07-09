// Search Option Component Logic
class SearchOptionComponent {
    constructor() {
        this.template = document.getElementById('search-option-template');
    }

    createSearchOption(louvor) {
        const clone = this.template.content.cloneNode(true);

        // Fill in the data
        const title = clone.querySelector('.search-option-louvor-title');
        const numero = clone.querySelector('.search-option-louvor-numero');
        const classificacao = clone.querySelector('.search-option-louvor-classificacao');
        const categoria = clone.querySelector('.search-option-louvor-categoria');

        title.textContent = louvor["nome"];
        numero.textContent = louvor["numero"];
        classificacao.textContent = this.formatClassificacao(louvor["classificacao"]);
        categoria.textContent = louvor["categoria"];

        if (louvor["numero"] === undefined || louvor["numero"] === null || louvor["numero"] === '') {
            numero.style.display = 'none';
        }

        // Set PDF link
        const pdfPath = this.getPdfPath(louvor);

        // Add click handler to card (optional)
        const card = clone.querySelector('.search-option-louvor-card');
        card.addEventListener('click', (e) => {
            window.open(pdfPath, '_blank');
        });

        return clone;
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

    getPdfPath(louvor) {
        const folder = this.pdfMapper(louvor["classificacao"]);
        return `assets/${folder}${louvor["pdf"]}`;
    }

    pdfMapper(v) {
        const dic = {
            'ColAdultos': 'ColAdultos/',
            'ColCIAs': 'ColCIAs/',
        }

        if (dic[v]) return dic[v];
        return 'Avulsos/'
    }

}
