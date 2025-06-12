let allSets = [];

async function fetchAllSets() {
  const res = await fetch('https://api.pokemontcg.io/v2/sets');
  const data = await res.json();
  allSets = data.data;
  renderSets();
}

function renderSets() {
  const setsContainer = document.getElementById('sets-container');
  setsContainer.innerHTML = '';
  allSets.forEach(set => {
    setsContainer.innerHTML += `
      <div class="set-card bg-white rounded shadow p-2 flex flex-col items-center" data-id="${set.id}">
        <h3 class="font-bold text-center text-sm mb-1">${set.name}</h3>
        <img src="${set.images.logo}" alt="${set.name}" class="w-24 h-16 object-contain mb-2"/>
        <div class="text-xs text-center mb-1">Release: ${set.releaseDate || '-'}</div>
        <button class="view-details bg-blue-900 text-white px-2 py-1 rounded text-xs hover:bg-blue-700">Details</button>
      </div>
    `;
  });
  addSetEventListeners();
}

function addSetEventListeners() {
  document.querySelectorAll('.set-card .view-details').forEach(button => {
    button.onclick = (event) => {
      const setId = event.target.closest('.set-card').dataset.id;
      showModal(allSets.find(set => set.id === setId));
    };
  });
}

function showModal(set) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const title = document.getElementById('modal-title');
  title.textContent = set.name;
  content.innerHTML = `
    <img src="${set.images.logo}" alt="${set.name}" class="w-full mb-2"/>
    <table class="w-full text-xs mb-2">
      <tr><td class="font-bold">Release</td><td>${set.releaseDate || '-'}</td></tr>
      <tr><td class="font-bold">Total Cards</td><td>${set.total || '-'}</td></tr>
      <tr><td class="font-bold">ID</td><td>${set.id}</td></tr>
      <tr><td class="font-bold">Series</td><td>${set.series || '-'}</td></tr>
    </table>
    <div class="mb-1">${set.ptcgoCode ? `<span class="font-bold">PTCGO:</span> ${set.ptcgoCode}` : ''}</div>
  `;
  modal.classList.remove('hidden');
}

document.getElementById('close-modal').onclick = () => {
  document.getElementById('modal').classList.add('hidden');
};

fetchAllSets();