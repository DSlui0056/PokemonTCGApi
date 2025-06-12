let allCards = [];
let allSets = [];
let allTypes = [];
let allRarities = [];
let filteredCards = [];

async function fetchAllData() {
  const [cardsRes, setsRes] = await Promise.all([
    fetch('https://api.pokemontcg.io/v2/cards?q=set.id:base4&pageSize=250'),
    fetch('https://api.pokemontcg.io/v2/sets')
  ]);
  const cardsData = await cardsRes.json();
  const setsData = await setsRes.json();

  allCards = cardsData.data;
  allSets = setsData.data;
  // Verzamel unieke types en rarities
  allTypes = [...new Set(allCards.flatMap(card => card.types || []))];
  allRarities = [...new Set(allCards.map(card => card.rarity).filter(Boolean))];

  renderTypeFilters();
  renderRarityFilter();
  renderSetFilter();
  applyFilters();
}

function renderTypeFilters() {
  const typeSection = document.querySelector('aside section');
  typeSection.innerHTML = `
    <h2 class="font-bold mb-2 text-base">Type</h2>
    <div id="type-buttons" class="flex flex-col gap-2"></div>
  `;
  const btns = document.getElementById('type-buttons');
  btns.innerHTML =
    `<button class="bg-blue-900 text-white px-4 py-1 rounded text-sm type-btn${filterState.type === '' ? ' bg-blue-700' : ''}" data-type="">Alle types</button>` +
    allTypes.map(type =>
      `<button class="bg-blue-900 text-white px-4 py-1 rounded text-sm type-btn${filterState.type === type ? ' bg-blue-700' : ''}" data-type="${type}">${type}</button>`
    ).join('');
  // Event listeners
  btns.querySelectorAll('.type-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.type-btn').forEach(b => {
        b.classList.remove('bg-blue-700');
        b.classList.add('bg-blue-900');
        b.classList.add('text-white');
      });
      btn.classList.remove('bg-blue-900');
      btn.classList.add('bg-blue-700');
      btn.classList.add('text-white');
      document.getElementById('rarity-select').selectedIndex = 0;
      document.getElementById('set-input').value = '';
      filterState.type = btn.dataset.type;
      filterState.rarity = '';
      filterState.set = '';
      applyFilters();
    };
  });
}

function renderRarityFilter() {
  const raritySelect = document.querySelector('select');
  raritySelect.id = 'rarity-select';
  raritySelect.innerHTML = `<option value="">Alle rarities</option>` +
    allRarities.map(r => `<option value="${r}">${r}</option>`).join('');
  raritySelect.onchange = () => {
    document.querySelectorAll('.type-btn').forEach(b => {
      b.classList.remove('bg-blue-700');
      b.classList.add('bg-blue-900');
      b.classList.add('text-white');
    });
    filterState.type = '';
    filterState.rarity = raritySelect.value;
    filterState.set = '';
    document.getElementById('set-input').value = '';
    applyFilters();
  };
}

function renderSetFilter() {
  const setInput = document.querySelector('input[type="text"]');
  setInput.id = 'set-input';
  setInput.placeholder = 'Zoek set...';
  setInput.oninput = () => {
    filterState.set = setInput.value.trim().toLowerCase();
    filterState.type = '';
    filterState.rarity = '';
    document.querySelectorAll('.type-btn').forEach(b => {
      b.classList.remove('bg-blue-700');
      b.classList.add('bg-blue-900');
      b.classList.add('text-white');
    });
    document.getElementById('rarity-select').selectedIndex = 0;
    applyFilters();
  };
}

const filterState = {
  type: '',
  rarity: '',
  set: ''
};

function applyFilters() {
  filteredCards = allCards.filter(card => {
    let match = true;
    if (filterState.type) {
      match = card.types && card.types.includes(filterState.type);
    }
    if (match && filterState.rarity) {
      match = card.rarity === filterState.rarity;
    }
    if (match && filterState.set) {
      match = card.set.name.toLowerCase().includes(filterState.set);
    }
    return match;
  });
  renderCards(filteredCards.length ? filteredCards : allCards);
}

function renderCards(cards) {
  const container = document.getElementById('cards-container');
  container.innerHTML = '';
  cards.forEach(card => {
    container.innerHTML += `
      <div class="bg-white rounded shadow p-2 flex flex-col items-center cursor-pointer border-2 border-blue-900 hover:scale-105 transition" data-id="${card.id}">
        <img src="${card.images.small}" alt="${card.name}" class="w-28 h-36 object-contain mb-2 border border-gray-300">
        <div class="font-bold text-center text-sm bg-blue-900 text-white w-full rounded mb-1 py-0.5">${card.name}</div>
        <div class="text-xs text-center bg-white border-t border-blue-900 w-full py-0.5">${card.set.name}</div>
      </div>
    `;
  });
  // Add click event for modal
  document.querySelectorAll('[data-id]').forEach(el => {
    el.addEventListener('click', () => showModal(cards.find(c => c.id === el.dataset.id)));
  });
}

function showModal(card) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const title = document.getElementById('modal-title');
  title.textContent = card.name;
  content.innerHTML = `
    <img src="${card.images.small}" alt="${card.name}" class="w-32 h-40 mx-auto mb-2 border border-gray-300">
    <table class="w-full text-xs border border-blue-900 mb-2">
      <tr>
        <td class="border border-blue-900 px-1 font-bold bg-blue-100">Type</td>
        <td class="border border-blue-900 px-1">${card.types ? card.types.join(', ') : ''} ${card.hp ? `| ${card.hp} HP` : ''}</td>
      </tr>
      <tr>
        <td class="border border-blue-900 px-1 font-bold bg-blue-100">Set</td>
        <td class="border border-blue-900 px-1">${card.set.name}</td>
      </tr>
      <tr>
        <td class="border border-blue-900 px-1 font-bold bg-blue-100">TCGPlayer</td>
        <td class="border border-blue-900 px-1">Prices</td>
      </tr>
      <tr>
        <td class="border border-blue-900 px-1">Market</td>
        <td class="border border-blue-900 px-1">${card.tcgplayer?.prices?.normal?.market ?? '-'}</td>
      </tr>
      <tr>
        <td class="border border-blue-900 px-1">High</td>
        <td class="border border-blue-900 px-1">${card.tcgplayer?.prices?.normal?.high ?? '-'}</td>
      </tr>
    </table>
  `;
  modal.classList.remove('hidden');
}

document.getElementById('close-modal').onclick = () => {
  document.getElementById('modal').classList.add('hidden');
};

async function fetchAllCardsFromAllSets() {
  const setsRes = await fetch('https://api.pokemontcg.io/v2/sets');
  const setsData = await setsRes.json();
  const allSets = setsData.data;

  let allCards = [];

  for (const set of allSets) {
    let page = 1;
    let hasMore = true;
    while (hasMore) {
      const cardsRes = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${set.id}&pageSize=250&page=${page}`);
      const cardsData = await cardsRes.json();
      allCards = allCards.concat(cardsData.data);
      if (cardsData.data.length < 250) {
        hasMore = false;
      } else {
        page++;
      }
    }
  }
  return allCards;
}

fetchAllData();