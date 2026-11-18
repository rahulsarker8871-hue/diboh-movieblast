let allMovies = [];
const $ = id => document.getElementById(id);

fetch('data/movies.json').then(res => res.json()).then(data => {
  allMovies = data;
  initApp();
});

function initApp() {
  const topMovie = [...allMovies].sort((a,b) => b.popularity - a.popularity)[0];
  $('hero-backdrop').style.backgroundImage = `url('${topMovie.poster}')`;
  $('hero-content').innerHTML = `
    <h1>${topMovie.title}</h1>
    <p>${topMovie.description}</p>
    <button class="btn-primary" onclick="openModal('${topMovie.id}')">বিস্তারিত দেখুন</button>
  `;

  renderGrid('trendingGrid', [...allMovies].sort((a,b) => b.popularity - a.popularity).slice(0, 5));
  renderGrid('latestGrid', [...allMovies].sort((a,b) => b.year - a.year).slice(0, 5));
  renderGrid('popularGrid', [...allMovies].sort((a,b) => b.rating - a.rating).slice(0, 5));

  const genres = [...new Set(allMovies.flatMap(m => m.genre))];
  const langs = [...new Set(allMovies.map(m => m.language))];
  $('genreFilter').innerHTML += genres.map(g => `<option value="${g}">${g}</option>`).join('');
  $('langFilter').innerHTML += langs.map(l => `<option value="${l}">${l}</option>`).join('');
}

function renderGrid(containerId, movies) {
  $(containerId).innerHTML = movies.map(m => `
    <div class="movie-card" onclick="openModal('${m.id}')">
      <img src="${m.poster}" alt="${m.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/200x300?text=No+Image'">
      <div class="movie-info">
        <h3>${m.title}</h3>
        <p>${m.year} • ${m.language}</p>
      </div>
    </div>
  `).join('');
}

function openModal(id) {
  const m = allMovies.find(x => x.id === id);
  if(!m) return;
  
  $('modal-img').src = m.poster;
  $('modal-title').textContent = m.title;
  $('modal-year').textContent = m.year;
  $('modal-runtime').textContent = m.runtime;
  $('modal-rating').textContent = `★ ${m.rating}`;
  $('modal-desc').textContent = m.description;
  $('modal-cast').textContent = m.cast.join(', ');
  $('modal-source').textContent = m.sourceName;
  $('modal-rights').textContent = m.rightsStatus;
  $('modal-evidence').textContent = m.rightsEvidence;

  $('modal-downloads').innerHTML = m.downloadOptions.map(opt => `
    <a href="${opt.url}" target="_blank" class="dl-btn">
      <span class="dl-quality">${opt.quality}</span>
      <span class="dl-size">${opt.size}</span>
    </a>
  `).join('');

  $('modal').classList.remove('hidden');
}

$('closeModal').onclick = () => $('modal').classList.add('hidden');

function handleFilter() {
  const q = $('searchInput').value.toLowerCase();
  const g = $('genreFilter').value;
  const l = $('langFilter').value;

  if(q === '' && g === '' && l === '') {
    $('searchResultsSection').classList.add('hidden');
    $('defaultSections').classList.remove('hidden');
    return;
  }

  const filtered = allMovies.filter(m => {
    const matchQ = m.title.toLowerCase().includes(q) || m.year.toString().includes(q);
    const matchG = g === '' || m.genre.includes(g);
    const matchL = l === '' || m.language === l;
    return matchQ && matchG && matchL;
  });

  $('defaultSections').classList.add('hidden');
  $('searchResultsSection').classList.remove('hidden');
  
  if(filtered.length === 0) {
    $('searchGrid').innerHTML = '';
    $('noResults').classList.remove('hidden');
  } else {
    $('noResults').classList.add('hidden');
    renderGrid('searchGrid', filtered);
  }
}

$('searchInput').addEventListener('input', handleFilter);
$('genreFilter').addEventListener('change', handleFilter);
$('langFilter').addEventListener('change', handleFilter);
