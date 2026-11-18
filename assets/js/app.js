let allMovies = [];
let currentLang = localStorage.getItem('siteLang') || 'en'; // ডিফল্ট ইংরেজি
const $ = id => document.getElementById(id);

const i18n = {
  en: {
    nav_home: "Home", nav_trending: "Trending", nav_latest: "Latest",
    search_ph: "Search movies...", all_genres: "All Genres", all_langs: "All Languages",
    sort_latest: "Latest", sort_popular: "Popular", sort_rating: "Rating",
    search_results: "Search Results", no_movies: "No movies found",
    trending_title: "🔥 Trending Movies", latest_title: "🆕 Latest Added", popular_title: "⭐ Most Popular",
    view_details: "View Details", cast_label: "Cast:", source_label: "Source:", rights_label: "Rights:",
    download_title: "⬇️ Download Options", footer_text: "© 2025 Diboh MovieBlast | Only legal public domain content.",
    privacy: "Privacy Policy", terms: "Terms of Use", copyright: "Copyright Policy"
  },
  bn: {
    nav_home: "হোম", nav_trending: "ট্রেন্ডিং", nav_latest: "সর্বশেষ",
    search_ph: "মুভি খুঁজুন...", all_genres: "সব জেনার", all_langs: "সব ভাষা",
    sort_latest: "সর্বশেষ", sort_popular: "জনপ্রিয়", sort_rating: "রেটিং",
    search_results: "সার্চ ফলাফল", no_movies: "কোনো মুভি পাওয়া যায়নি",
    trending_title: "🔥 ট্রেন্ডিং মুভি", latest_title: "🆕 সর্বশেষ যোগ করা", popular_title: "⭐ সর্বাধিক জনপ্রিয়",
    view_details: "বিস্তারিত দেখুন", cast_label: "কাস্ট:", source_label: "সোর্স:", rights_label: "অধিকার:",
    download_title: "⬇️ ডাউনলোড অপশন", footer_text: "© ২০২৫ Diboh MovieBlast | শুধুমাত্র বৈধ পাবলিক ডোমেইন কন্টেন্ট।",
    privacy: "প্রাইভেসি পলিসি", terms: "শর্তাবলী", copyright: "কপিরাইট পলিসি"
  }
};

function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('siteLang', lang);
  $('langSwitcher').value = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if(i18n[lang][key]) el.textContent = i18n[lang][key];
  });
  document.querySelectorAll('[data-translate-ph]').forEach(el => {
    const key = el.getAttribute('data-translate-ph');
    if(i18n[lang][key]) el.placeholder = i18n[lang][key];
  });

  // রি-রেন্ডার হিরো সেকশন
  if(allMovies.length > 0) {
    const topMovie = [...allMovies].sort((a,b) => b.popularity - a.popularity)[0];
    $('hero-content').innerHTML = `
      <h1>${topMovie.title}</h1>
      <p>${topMovie.description}</p>
      <button class="btn-primary" onclick="openModal('${topMovie.id}')">${i18n[lang].view_details}</button>
    `;
  }
}

function changeLanguage(lang) { applyLanguage(lang); }

fetch('data/movies.json').then(res => res.json()).then(data => {
  allMovies = data;
  applyLanguage(currentLang); // প্রথমে ভাষা সেট করুন
  initApp();
});

function initApp() {
  const topMovie = [...allMovies].sort((a,b) => b.popularity - a.popularity)[0];
  if(topMovie) $('hero-backdrop').style.backgroundImage = `url('${topMovie.poster}')`;

  renderGrid('trendingGrid', [...allMovies].sort((a,b) => b.popularity - a.popularity).slice(0, 5));
  renderGrid('latestGrid', [...allMovies].sort((a,b) => b.year - a.year).slice(0, 5));
  renderGrid('popularGrid', [...allMovies].sort((a,b) => b.rating - a.rating).slice(0, 5));

  const genres = [...new Set(allMovies.flatMap(m => m.genre))];
  const langs = [...new Set(allMovies.map(m => m.language))];
  $('genreFilter').innerHTML += genres.map(g => `<option value="${g}">${g}</option>`).join('');
  $('langFilter').innerHTML += langs.map(l => `<option value="${l}">${l}</option>`).join('');
}

function renderGrid(containerId, movies) {
  const container = $(containerId);
  if(!container) return;
  container.innerHTML = movies.map(m => `
    <div class="movie-card" onclick="openModal('${m.id}')">
      <img src="${m.poster}" alt="${m.title}" loading="lazy" onerror="this.src='https://placehold.co/400x600/13131c/f5b301?text=No+Image'">
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
  $('modal-img').onerror = function() { this.src='https://placehold.co/300x450/13131c/f5b301?text=No+Image'; };
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
  const s = $('sortFilter').value;

  if(q === '' && g === '' && l === '') {
    $('searchResultsSection').classList.add('hidden');
    $('defaultSections').classList.remove('hidden');
    return;
  }
  let filtered = allMovies.filter(m => {
    const matchQ = m.title.toLowerCase().includes(q) || m.year.toString().includes(q);
    const matchG = g === '' || m.genre.includes(g);
    const matchL = l === '' || m.language === l;
    return matchQ && matchG && matchL;
  });
  
  if(s === 'popular') filtered.sort((a,b) => b.popularity - a.popularity);
  else if(s === 'rating') filtered.sort((a,b) => b.rating - a.rating);
  else filtered.sort((a,b) => b.year - a.year);

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
$('sortFilter').addEventListener('change', handleFilter);
