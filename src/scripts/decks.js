let allSets = [];
let currentSetId = null;
let allCards = [];
const DEFAULT_LIMIT = 10;
let cardsShown = DEFAULT_LIMIT;

async function fetchAllSets() {
  const res = await fetch('https://api.pokemontcg.io/v2/sets');
  const data = await res.json();
  allSets = data.data;
  renderDeckSets();
}

function renderDeckSets() {
  const decksContainer = document.getElementById('sets-container');
  decksContainer.innerHTML = '';
  allSets.forEach(set => {
    decksContainer.innerHTML += `
      <div class="set-card bg-white rounded shadow p-2 flex flex-col items-center" data-id="${set.id}">
        <h3 class="font-bold text-center text-sm mb-1">${set.name}</h3>
        <img src="${set.images.logo}" alt="${set.name}" class="w-24 h-16 object-contain mb-2"/>
        <div class="text-xs text-center mb-1">Release: ${set.releaseDate || '-'}</div>
        <button class="view-details bg-blue-900 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Bekijk kaarten</button>
      </div>
    `;
  });
  addDeckSetEventListeners();
}

function addDeckSetEventListeners() {
  document.querySelectorAll('.set-card .view-details').forEach(button => {
    button.onclick = async (event) => {
      const setId = event.target.closest('.set-card').dataset.id;
      currentSetId = setId;
      cardsShown = DEFAULT_LIMIT;
      await fetchCardsBySet(setId);
    };
  });
}

async function fetchCardsBySet(setId) {
  const res = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}&pageSize=250`);
  const data = await res.json();
  allCards = data.data;
  renderCards();
}

function renderCards() {
  const decksContainer = document.getElementById('sets-container');
  decksContainer.innerHTML = `
    <button id="back-to-sets" class="mb-4 bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-700">&larr; Terug naar sets</button>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
      ${allCards.slice(0, cardsShown).map(card => `
        <div class="deck-card bg-white rounded shadow p-2 flex flex-col items-center" data-id="${card.id}">
          <h3 class="font-bold text-center text-sm mb-1">${card.name}</h3>
          <img src="${card.images.small}" alt="${card.name}" class="w-full h-32 object-contain mb-2"/>
          <div class="text-xs text-center mb-1">${card.set?.name || ''}</div>
          <button class="view-details bg-blue-900 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Details</button>
        </div>
      `).join('')}
    </div>
    ${allCards.length > cardsShown ? `<button id="more-cards" class="mt-4 bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-700 w-full font-semibold">Meer laden</button>` : ''}
  `;
  document.getElementById('back-to-sets').onclick = () => {
    renderDeckSets();
  };
  if (allCards.length > cardsShown) {
    document.getElementById('more-cards').onclick = () => {
      cardsShown += DEFAULT_LIMIT;
      renderCards();
    };
  }
  addCardEventListeners();
}

function addCardEventListeners() {
  document.querySelectorAll('.deck-card .view-details').forEach(button => {
    button.onclick = (event) => {
      const cardId = event.target.closest('.deck-card').dataset.id;
      showModal(allCards.find(card => card.id === cardId));
    };
  });
}

function showModal(card) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const title = document.getElementById('modal-title');
  title.textContent = card.name;
  content.innerHTML = `
    <img src="${card.images?.large || card.images?.small || ''}" alt="${card.name}" class="w-full mb-2"/>
    <table class="w-full text-xs mb-2">
      <tr><td class="font-bold">Type</td><td>${card.types ? card.types.join(', ') : '-'}</td></tr>
      <tr><td class="font-bold">HP</td><td>${card.hp || '-'}</td></tr>
      <tr><td class="font-bold">Set</td><td>${card.set?.name || '-'}</td></tr>
      <tr><td class="font-bold">Rarity</td><td>${card.rarity || '-'}</td></tr>
      <tr><td class="font-bold">ID</td><td>${card.id}</td></tr>
    </table>
    ${card.tcgplayer?.prices?.normal ? `
      <div class="mb-1">
        <span class="font-bold">TCGPlayer:</span>
        <span>Market $${card.tcgplayer.prices.normal.market || '-'} | High $${card.tcgplayer.prices.normal.high || '-'}</span>
      </div>
    ` : ''}
  `;
  modal.classList.remove('hidden');
}

document.getElementById('close-modal').onclick = () => {
  document.getElementById('modal').classList.add('hidden');
};

fetchAllSets();