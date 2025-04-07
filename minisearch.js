document.addEventListener('DOMContentLoaded', () => {
    fetch('/data/games.json')
        .then(response => response.json())
        .then(games => {
            if (games && Array.isArray(games)) {
                setupSidebarSearch(games);
            } else {
                console.error('Games data is not an array or is empty.');
            }
        })
        .catch(error => {
            console.error('Error fetching games:', error);
        });
});

function setupSidebarSearch(games) {
    const searchTrigger = document.getElementById('sidebar-search-trigger');
    const searchModal = document.getElementById('search-modal');
    const searchInput = document.getElementById('search-modal-input');
    const searchResults = document.getElementById('search-modal-results');

    searchTrigger.addEventListener('click', () => {
        searchModal.classList.add('show');
        searchModal.classList.remove('hide');
        searchModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('blur-background');
    });

    searchModal.addEventListener('click', (event) => {
        if (event.target === searchModal) {
            closeModal(searchModal);
        }
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredGames = games.filter(game => game.name.toLowerCase().includes(query));
        displaySearchResults(filteredGames, searchResults);
    });
}

function closeModal(searchModal) {
    searchModal.classList.add('hide');
    searchModal.classList.remove('show');
    setTimeout(() => {
        searchModal.classList.add('hidden');
    }, 300);
    document.body.style.overflow = 'auto';
    document.body.classList.remove('blur-background');
}

function displaySearchResults(filteredGames, searchResultsContainer) {
    searchResultsContainer.innerHTML = '';

    if (filteredGames.length === 0) {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.textContent = '0 games were found :(';
        searchResultsContainer.appendChild(noResultsMessage);
    } else {
        filteredGames.forEach((game, index) => {
            const gameItem = document.createElement('div');
            gameItem.className = 'search-result-item';

            const gameImage = document.createElement('img');
            gameImage.src = `/gs/${game.directory}/${game.image}`;
            gameImage.alt = game.name;
            gameImage.className = 'search-result-image';

            const gameName = document.createElement('span');
            gameName.className = 'search-result-name';
            gameName.textContent = game.name;

            gameItem.appendChild(gameImage);
            gameItem.appendChild(gameName);

            gameItem.addEventListener('click', () => {
                openGamePage(`/gs/${game.directory}`, game.name);
            });

            setTimeout(() => {
                gameItem.classList.add('result-visible');
            }, index * 10);

            searchResultsContainer.appendChild(gameItem);
        });
    }
}

function openGamePage(gamePath, gameName) {
    const url = `/gsl/loader.html?path=${encodeURIComponent(gamePath)}&name=${encodeURIComponent(gameName)}`;
    const iframe = document.getElementById('content-iframe');
    iframe.src = url;
    closeModal(document.getElementById('search-modal'));
}
