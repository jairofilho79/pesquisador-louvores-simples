const handleInputValidation = (event) => {
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const searchButtonDisabled = document.getElementById("searchButtonDisabled");
  if (event.key === 'Enter' && searchInput.value.trim() !== "") {
    handleSearch();
    searchInput.blur(); // Remove focus from the input field
  }
  if (searchInput.value.trim() !== "") {
    searchButton.style.display = "block";
    searchButtonDisabled.style.display = "none";
  } else {
    searchButton.style.display = "none";
    searchButtonDisabled.style.display = "block";
  }
}

const clearSearch = () => {
  const searchInput = document.getElementById("searchInput");
  searchInput.value = "";
  searchInput.focus();
  handleInputValidation({ key: '' });
}

// New handleSearch: calls the API endpoint
const handleSearch = async () => {
  const search = document.getElementById("searchInput").value.trim();
  if (!search) {
    makeHTMLSearchResponse([]);
    return;
  }
  try {
    const response = await fetch(`/api/louvores/search?q=${encodeURIComponent(search)}`);
    if (!response.ok) throw new Error('Erro ao buscar louvores');
    const louvores = await response.json();
    makeHTMLSearchResponse(louvores);
  } catch (err) {
    makeHTMLSearchResponse([]);
    alert('Erro ao buscar louvores');
  }
}

const normalizeSearchString = (str) => {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9\s]/g, '');
}

const makeHTMLSearchResponse = (lvs) => {
  const searchResults = document.getElementById("searchResults");
  searchResults.style.display = "flex";
  searchResults.style.flexDirection = "column";
  searchResults.style.alignItems = "center";
  searchResults.style.marginTop = "20px";
  searchResults.innerHTML = "";
  if (lvs.length === 0) {
    searchResults.innerHTML = "<p>Nenhum resultado encontrado.</p>";
    return;
  }
  lvs.forEach(louvor => {
    const louvorItem = document.createElement("div");
    louvorItem.className = "louvor-item";
    louvorItem.style.marginBottom = "15px";
    louvorItem.appendChild(makeHTMLSearchCardResponse(louvor));
    searchResults.appendChild(louvorItem);
  });
}

const makeHTMLSearchCardResponse = (louvor) => {
  const card = document.createElement("div");
  card.className = "louvor-card";
  card.innerHTML = `
    <a href="assets/${pdfMapper(louvor['classificacao'])}${louvor['pdf']}" target="_blank" class="card-link" style="text-decoration: none; color: inherit;">
      <div style="
        display: grid;
        grid-template-rows: auto 1fr auto;
        width: 60vw;
        height: 25vh;
        padding: 1.5rem;
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        transition: transform 0.2s;
        background-color: #fff;
      ">
        <div style="
          font-size: clamp(1rem, 2vw, 1.5rem);
          font-weight: 500;
          text-align: center;
          margin-bottom: 1rem;
        ">
          <strong>#${enumMapper(louvor['numero']) || 'N/A'}</strong> - ${louvor['nome'] || 'Sem título'}
        </div>
        <div style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5rem;
          text-align: center;
        ">
          <div style="
            font-size: clamp(0.8rem, 1.5vw, 1rem);
            color: #555;
          ">
            ${enumMapper(louvor['classificacao']) || 'Sem classificação'}
          </div>
          <div style="
            font-size: clamp(0.8rem, 1.5vw, 1rem);
            color: #666;
          ">
            ${louvor['categoria'] || 'Sem categoria'}
          </div>
        </div>
      </div>
    </a>
  `;
  return card;
}

const numeroEnum = {
  0: "CC"
}

const pdfMapper = (v) => {
  const dic = {
    'ColAdultos': 'ColAdultos/',
    'ColCIAs': 'ColCIAs/',
  }

  if(dic[v]) return dic[v];
  return 'Avulsos/'
}

const classificacaoEnum = {
  'ColAdultos': "Coletânea de Partituras Adultos",
  'ColCIAs': "Coletânea de Partituras CIAs",
  'A': "Avulso PES",
  'DpLICM': "Departamento de Louvor ICM",
  'EL042025': "Encontro de Louvor 04/25",
  'GLGV': "Grupo de Louvor Gov. Valadares",
  'GLMUberlandia': "Grupo de Louvor do Maanaim de Uberlândia",
  'ACIA': 'Avulso CIAs',
  'PESCol': 'Novo Arranjo PES',
}

const enumMapper = (v) => {
  if(numeroEnum[v]) return numeroEnum[v];
  if(classificacaoEnum[v]) return classificacaoEnum[v];
  return v;
}
