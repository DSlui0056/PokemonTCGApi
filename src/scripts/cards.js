let allCards = [];
let allTypes = new Set();
let allRarities = new Set();
let allSets = [];
let filteredCards = [];
let loading = false;
const DEFAULT_LIMIT = 10;
let cardsShown = DEFAULT_LIMIT;

async function fetchAllCards() {
  loading = true;
  renderCards();
  try {
    allCards = [];
    const res = await fetch('https://api.pokemontcg.io/v2/cards?page=1&pageSize=250');
    if (!res.ok) throw new Error('Fout bij ophalen kaarten');
    const data = await res.json();
    allCards = data.data;
    filteredCards = allCards;
    collectFilters();
    cardsShown = DEFAULT_LIMIT;
  } catch (e) {
    showError(e.message);
  }
  loading = false;
  renderCards();
}

async function fetchAllSets() {
  try {
    const res = await fetch('https://api.pokemontcg.io/v2/sets');
    if (!res.ok) throw new Error('Fout bij ophalen sets');
    const data = await res.json();
    allSets = data.data;
    renderSetFilter();
  } catch (e) {
  }
}

function collectFilters() {
  allTypes = new Set();
  allRarities = new Set();
  allCards.forEach(card => {
    (card.types || []).forEach(type => allTypes.add(type));
    if (card.rarity) allRarities.add(card.rarity);
  });
  renderTypeFilter();
  renderRarityFilter();
}

function renderTypeFilter() {
  const container = document.getElementById('type-filters');
  container.innerHTML = '';
  Array.from(allTypes).sort().forEach(type => {
    const btn = document.createElement('button');
    btn.textContent = type;
    btn.className = "bg-blue-900 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 w-full mb-2";
    btn.onclick = () => {
      filteredCards = allCards.filter(card => card.types && card.types.includes(type));
      cardsShown = DEFAULT_LIMIT;
      renderCards();
    };
    container.appendChild(btn);
  });
}

function renderRarityFilter() {
  const select = document.getElementById('rarity-filter');
  select.innerHTML = '<option value="">Alle</option>';
  Array.from(allRarities).sort().forEach(rarity => {
    const opt = document.createElement('option');
    opt.value = rarity;
    opt.textContent = rarity;
    select.appendChild(opt);
  });
  select.onchange = () => {
    const val = select.value;
    filteredCards = val ? allCards.filter(card => card.rarity === val) : allCards;
    cardsShown = DEFAULT_LIMIT;
    renderCards();
  };
}

function renderSetFilter() {
  const select = document.getElementById('set-filter');
  select.innerHTML = '<option value="">Alle</option>';
  allSets.forEach(set => {
    const opt = document.createElement('option');
    opt.value = set.id;
    opt.textContent = set.name;
    select.appendChild(opt);
  });
  select.onchange = () => {
    const val = select.value;
    filteredCards = val ? allCards.filter(card => card.set && card.set.id === val) : allCards;
    cardsShown = DEFAULT_LIMIT;
    renderCards();
  };
}

function renderCards() {
  const container = document.getElementById('cards-container');
  if (loading) {
    container.innerHTML = '<p>Bezig met laden...</p>';
    return;
  }
  container.innerHTML = '';
  let cardsToShow = filteredCards.slice(0, cardsShown);
  if (cardsToShow.length === 0) {
    container.innerHTML = '<p>Geen kaarten gevonden.</p>';
    return;
  }
  cardsToShow.forEach(card => {
    container.innerHTML += `
      <div class="deck-card bg-white rounded shadow p-2 flex flex-col items-center" data-id="${card.id}">
        <h3 class="font-bold text-center text-sm mb-1">${card.name}</h3>
        <img src="${card.images.small}" alt="${card.name}" class="w-full h-32 object-contain mb-2"/>
        <div class="text-xs text-center mb-1">${card.set?.name || ''}</div>
        <button class="view-details bg-blue-900 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Details</button>
      </div>
    `;
  });

  // Meer laden knop
  if (filteredCards.length > cardsShown) {
    const moreBtn = document.createElement('button');
    moreBtn.textContent = 'Meer laden';
    moreBtn.className = 'mt-4 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 w-full font-semibold';
    moreBtn.onclick = () => {
      cardsShown += DEFAULT_LIMIT;
      renderCards();
    };
    container.appendChild(moreBtn);
  }
  addCardEventListeners();
}

function showError(msg) {
  const container = document.getElementById('cards-container');
  container.innerHTML = `<p class="text-red-600">${msg}</p>`;
}

function addCardEventListeners() {
  document.querySelectorAll('.deck-card .view-details').forEach(button => {
    button.onclick = (event) => {
      const cardId = event.target.closest('.deck-card').dataset.id;
      showModal(filteredCards.find(card => card.id === cardId));
    };
  });
}

function showModal(card) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const title = document.getElementById('modal-title');
  title.textContent = card.name;
  let priceHtml = '';
  if (card.tcgplayer?.prices) {
    const prices = card.tcgplayer.prices;
    priceHtml = `
      <tr>
        <td class="font-bold">TCGPlayer</td>
        <td>
          ${prices.normal ? `Market: $${prices.normal.market ?? '-'} | High: $${prices.normal.high ?? '-'}` : ''}
          ${prices.holofoil ? `<br>Holofoil Market: $${prices.holofoil.market ?? '-'} | High: $${prices.holofoil.high ?? '-'}` : ''}
          ${prices.reverseHolofoil ? `<br>Reverse Holo Market: $${prices.reverseHolofoil.market ?? '-'} | High: $${prices.reverseHolofoil.high ?? '-'}` : ''}
        </td>
      </tr>
    `;
  }
  content.innerHTML = `
    <img src="${card.images?.large || card.images?.small || ''}" alt="${card.name}" class="w-full mb-2"/>
    <table class="w-full text-xs mb-2">
      <tr><td class="font-bold">Type</td><td>${card.types ? card.types.join(', ') : '-'}</td></tr>
      <tr><td class="font-bold">HP</td><td>${card.hp || '-'}</td></tr>
      <tr><td class="font-bold">Set</td><td>${card.set?.name || '-'}</td></tr>
      <tr><td class="font-bold">Rarity</td><td>${card.rarity || '-'}</td></tr>
      <tr><td class="font-bold">ID</td><td>${card.id}</td></tr>
      ${priceHtml}
    </table>
  `;
  modal.classList.remove('hidden');
}

document.getElementById('close-modal').onclick = () => {
  document.getElementById('modal').classList.add('hidden');
};

fetchAllSets();
fetchAllCards();