let allMovies = [];
let displayedMovies = [];

fetch('data/movies.json')
  .then(res => res.json())
  .then(data => {
    allMovies = data;
    displayedMovies = data;
    renderMovies(displayedMovies);
    setHero(data[0]);
    populateFilters(data);
  });

function setHero(movie) {
  document.getElementById('hero-backdrop').style.backgroundImage = `url('${movie.poster}')`;
  document.getElementById('hero-content').innerHTML = `
    <h1>${movie.title}</h1>
    <p>${movie.description}</p>
    <button class="btn-primary" onclick="openModal('${movie.id}')">বিস্তারিত দেখুন</button>
  `;
}

function renderMovies(movies) {
  const grid = document.getElementById('movieGrid');
  const noResults = document.getElementById('noResults');
  if(movies.length === 0) {
    grid.innerHTML = '';
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');
  grid.innerHTML = movies.map(m => `
    <div class="movie-card" onclick="openModal('${m.id}')">
      <img src="${m.poster}" alt="${m.title}" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
      <div class="movie-info">
        <h3>${m.title}</h3>
        <p>${m.year} • ${m.language || 'N/A'}</p>
      </div>
    </div>
  `).join('');
}

function populateFilters(data) {
  const genres = [...new Set(data.flatMap(m => m.genre))];
  const langs = [...new Set(data.map(m => m.language))];
  document.getElementById('genreFilter').innerHTML += genres.map(g => `<option value="${g}">${g}</option>`).join('');
  document.getElementById('langFilter').innerHTML += langs.map(l => `<option value="${l}">${l}</option>`).join('');
}

document.getElementById('searchInput').addEventListener('input', filterData);
document.getElementById('genreFilter').addEventListener('change', filterData);
document.getElementById('langFilter').addEventListener('change', filterData);

function filterData() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  const g = document.getElementById('genreFilter').value;
  const l = document.getElementById('langFilter').value;
  
  const filtered = allMovies.filter(m => {
    const matchSearch = m.title.toLowerCase().includes(q) || m.year.toString().includes(q);
    const matchGenre = g === '' || m.genre.includes(g);
    const matchLang = l === '' || m.language === l;
    return matchSearch && matchGenre && matchLang;
  });
  renderMovies(filtered);
}

function openModal(id) {
  const m = allMovies.find(x => x.id === id);
  if(!m) return;
  document.getElementById('modal-img').src = m.poster;
  document.getElementById('modal-title').textContent = m.title;
  document.getElementById('modal-desc').textContent = m.description;
  document.getElementById('modal-download').href = m.downloadOptions[0]?.url || '#';
  document.getElementById('modal').classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('modal').classList.add('hidden');
});
