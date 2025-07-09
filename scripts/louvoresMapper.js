// Script Node.js para ler louvores.js, filtrar e mapear atributos, e salvar como JSON
const fs = require('fs');
const path = require('path');

const baseUrl = 'assets/';
const louvoresJsPath = path.resolve(__dirname, '../louvores.js');
const outputJsonPath = path.resolve(__dirname, '../louvoresMetadata.json');

// Função para obter o array de louvores do arquivo louvores.js
function getLouvoresArray(fileContent) {
    // Espera que o arquivo exporte um array, ex: const louvores = [ ... ];
    // Remove comentários e busca o array
    const arrayMatch = fileContent.match(/\[([\s\S]*)\]/m);
    if (!arrayMatch) return [];
    try {
        // Tenta parsear como JSON
        return JSON.parse('[' + arrayMatch[1] + ']');
    } catch (e) {
        // Fallback: eval (menos seguro, mas útil para arquivos JS simples)
        let louvores = [];
        try {
            eval(fileContent + '\nlouvores = louvores || [];');
        } catch (err) { }
        return louvores;
    }
}

function pdfMapper(v) {
    const dic = {
        'ColAdultos': 'ColAdultos/',
        'ColCIAs': 'ColCIAs/',
    }

    if (dic[v]) return dic[v];
    return 'Avulsos/'
}

function main() {
    if (!fs.existsSync(louvoresJsPath)) {
        console.error('Arquivo louvores.js não encontrado!');
        process.exit(1);
    }
    const fileContent = fs.readFileSync(louvoresJsPath, 'utf8');
    const louvoresArr = getLouvoresArray(fileContent);
    if (!Array.isArray(louvoresArr)) {
        console.error('Não foi possível extrair array de louvores.');
        process.exit(1);
    }
    const mapped = louvoresArr.map(l => ({
        nome: l.nome,
        numero: l.numero,
        pdf: baseUrl + pdfMapper(l.classificacao) + l.pdf
    }));
    fs.writeFileSync(outputJsonPath, JSON.stringify(mapped, null, 2), 'utf8');
    console.log('Arquivo salvo em', outputJsonPath);
}

main();
