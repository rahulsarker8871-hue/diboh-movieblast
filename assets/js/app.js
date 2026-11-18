fetch('data/movies.json')
  .then(res => res.json())
  .then(data => {
    document.getElementById('grid-trending').innerHTML = data.map(m => `
      <a href="movie.html?id=${m.id}" class="movie-card">
        <img src="${m.poster}" alt="${m.title}">
        <div class="movie-info"><h3>${m.title}</h3><p>${m.year}</p></div>
      </a>
    `).join('');
    document.getElementById('hero-content').innerHTML = `<h1>${data[0].title}</h1><p>${data[0].description}</p>`;
    document.getElementById('hero-backdrop').style.backgroundImage = `url('${data[0].poster}')`;
  })
  .catch(err => console.log('Error:', err));
