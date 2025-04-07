let database;
const GAMES_PER_PAGE = 18;
let currentPage = 1;
let filteredGames = [];

async function fetchTopRatedGames(games) {
    const { ref, get } = await import('https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js');
    const favoritesRef = ref(database, 'gamesFavorites');

    try {
        const snapshot = await get(favoritesRef);
        const favoriteCounts = snapshot.val() || {};

        console.log('Fetched favorite counts:', favoriteCounts);

        const gamesWithCounts = games
            .map(game => ({
                ...game,
                favoriteCount: favoriteCounts[game.directory] || 0
            }))
            .filter(game => game.favoriteCount > 0)
            .sort((a, b) => b.favoriteCount - a.favoriteCount)
            .slice(0, 10);

        console.log('Games with counts:', gamesWithCounts);

        if (gamesWithCounts.length === 0) {
            displayNoGamesMessage();
        } else {
            displayTopRatedGames(gamesWithCounts);
        }
    } catch (error) {
        console.error('Error fetching favorite counts:', error);
        displayNoGamesMessage();
    }
}

function displayNoGamesMessage() {
    const container = document.querySelector('#top-rated-games');
    if (!container) {
        console.log('Could not find the top-rated-games section.');
        return;
    }

    const gameList = container.querySelector('.game-list');
    if (!gameList) {
        console.log('Could not find the game list element inside top-rated-games section.');
        return;
    }

    gameList.innerHTML = ''; 

    const noGamesMessage = document.createElement('p');
    noGamesMessage.className = 'no-games-message';
    noGamesMessage.textContent = 'Start Favoriting those Games guys!';
    gameList.appendChild(noGamesMessage);
}

function displayTopRatedGames(topGames) {
    const container = document.querySelector('#top-rated-games');
    if (!container) {
        console.log('Could not find the top-rated-games section.');
        return;
    }

    const gameList = container.querySelector('.game-list');
    if (!gameList) {
        console.log('Could not find the game list element inside top-rated-games section.');
        return;
    }

    gameList.innerHTML = '';

    if (!topGames || topGames.length === 0) {
        console.log('No top rated games to display');
        return;
    }

    topGames.forEach((game, index) => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card game-card-hidden';

        const gameLink = document.createElement('a');
        gameLink.href = '#';
        gameLink.addEventListener('click', (event) => {
            event.preventDefault();
        });

        const imagePath = `/gs/${game.directory}/${game.image}`;
        const gamePath = `/gs/${game.directory}`;
        const gameId = `${game.directory}-${game.name}`;

        gameLink.innerHTML = `
            <div class="game-card-content">
                <img src="${imagePath}" alt="${game.name}" loading="lazy" crossorigin="anonymous">
                <div class="play-button">
                    <button class="play-btn">
                        <i class="fas fa-play"></i> Play Now
                    </button>
                </div>
                <div class="favorite-count">${game.favoriteCount} ⭐</div>
            </div>
            <h3>${game.name}</h3>
            <button class="favorite-btn" data-game-id="${gameId}">
                <i class="far fa-heart"></i>
            </button>
        `;

        const img = gameLink.querySelector('img');

        const playButton = gameLink.querySelector('.play-btn');
        playButton.addEventListener('click', () => {
            openGamePage(gamePath, game.name);
        });

        const favoriteButton = gameLink.querySelector('.favorite-btn');
        favoriteButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(game);
        });

        gameCard.appendChild(gameLink);
        gameList.appendChild(gameCard);

        setTimeout(() => {
            gameCard.classList.remove('game-card-hidden');
        }, index * 10);
    });

    topGames.forEach(game => {
        updateFavoriteButtonState(`${game.directory}-${game.name}`);
    });
}

const originalToggleFavorite = toggleFavorite;
toggleFavorite = async function(game) {
    const { ref, get, set } = await import('https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js');
    const gameId = `${game.directory}-${game.name}`;
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.findIndex(fav => fav.id === gameId);
    const isFavorited = index === -1;
    
    const gameRef = ref(database, `gamesFavorites/${game.directory}`);
    try {
        const snapshot = await get(gameRef);
        let currentCount = snapshot.val() || 0;

        if (isFavorited) {
            game.id = gameId;
            favorites.push(game);
            currentCount++; 
        } else {
            favorites.splice(index, 1);
            currentCount = Math.max(0, currentCount - 1);
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        window.showGameNotification(`${game.name} ${isFavorited ? 'was added to' : 'was removed from'} Your Favorites!`, isFavorited ? 'success' : 'error');
        
        await set(gameRef, currentCount);
        
        const favoriteCountElements = document.querySelectorAll(`[data-game-directory="${game.directory}"]`);
        favoriteCountElements.forEach(element => {
            element.textContent = `${currentCount} ⭐`;
        });
        
        updateFavoriteButtonState(gameId);
        
        const gamesResponse = await fetch('/data/games.json');
        const games = await gamesResponse.json();
        await fetchTopRatedGames(games);
    } catch (error) {
        console.error('Error updating favorite count:', error);
    }
};

async function calculateTotalFavorites(gameDirectory) {
    const allFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return allFavorites.filter(fav => fav.directory === gameDirectory).length;
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const firebase = await import('https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js');
        const { getDatabase } = await import('https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js');
        
        const firebaseConfig = {
            apiKey: "AIzaSyC0b77FDM1rgJ098o3DaLUfafso7B-jCE0",
            authDomain: "sefic-1cfb9.firebaseapp.com",
            databaseURL: "https://sefic-1cfb9-default-rtdb.firebaseio.com",
            projectId: "sefic-1cfb9",
            storageBucket: "sefic-1cfb9.firebasestorage.app",
            messagingSenderId: "608741886205",
            appId: "1:608741886205:web:dbc1112a5f1a1987b55694",
            measurementId: "G-03T5F3JYGZ"
        };

        const app = firebase.initializeApp(firebaseConfig);
        database = getDatabase(app);

        const response = await fetch('/data/games.json');
        const games = await response.json();

        if (games && Array.isArray(games)) {
            preloadImages(games);
            displayFeaturedGame(games);
            await fetchTopRatedGames(games);
            displayGames(games);
            setupSearch(games);
            updateSearchPlaceholder(games.length);
            loadFavorites(games);
        } else {
            console.error('Games data is not an array or is empty.');
        }
    } catch (error) {
        console.error('Error initializing games:', error);
    }
});

function preloadImages(games) {
    games.forEach(game => {
        const img = new Image();
        img.decoding = 'async';
        img.src = `/gs/${game.directory}/${game.image}`;
    });
}

function displayFeaturedGame(games) {
    const featuredGameContainer = document.getElementById('featured-game');
    
    if (!featuredGameContainer) {
        console.error('Featured game container not found');
        return;
    }
     const updateFeaturedGame = () => {
        featuredGameContainer.style.opacity = 0;
         setTimeout(() => {
            const randomGame = games[Math.floor(Math.random() * games.length)];
            const imagePath = `/gs/${randomGame.directory}/${randomGame.image}`;
            const gamePath = `/gs/${randomGame.directory}`;
            featuredGameContainer.innerHTML = `
                <img src="${imagePath}" alt="${randomGame.name}" loading="lazy" crossorigin="anonymous">
                <div class="featured-game-content">
                    <h2>${randomGame.name}</h2>
                    <div class="actions">
                        <button class="play-btn">
                            <i class="fas fa-play"></i> Play Now
                        </button>
                    </div>
                </div>
            `;
             const img = featuredGameContainer.querySelector('img');
            
             const playButton = featuredGameContainer.querySelector('.play-btn');
            playButton.addEventListener('click', () => {
                openGamePage(gamePath, randomGame.name);
            });
             featuredGameContainer.classList.remove('fade-in');
            void featuredGameContainer.offsetWidth;
            featuredGameContainer.classList.add('fade-in');
            featuredGameContainer.style.opacity = 1;
         }, 100);
    };
     updateFeaturedGame();
    setInterval(updateFeaturedGame, 4000);
}
async function displayGames(games) {
    filteredGames = games;
    const { ref, get } = await import('https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js');
    const favoritesRef = ref(database, 'gamesFavorites');
    let favoriteCounts = {};

    try {
        const snapshot = await get(favoritesRef);
        favoriteCounts = snapshot.val() || {};
    } catch (error) {
        console.error('Error fetching favorite counts:', error);
    }

    const gameList = document.getElementById('game-list');
    gameList.innerHTML = '';

    if (!games || games.length === 0) {
        const noGamesMessage = document.createElement('p');
        noGamesMessage.className = 'no-games-message';
        noGamesMessage.textContent = '0 games were found :(';
        gameList.appendChild(noGamesMessage);
        updatePaginationControls();
        return;
    }

    const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
    const endIndex = startIndex + GAMES_PER_PAGE;
    const gamesForCurrentPage = games.slice(startIndex, endIndex);

    const fragment = document.createDocumentFragment();

    gamesForCurrentPage.forEach((game, index) => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-card game-card-hidden';

        const imagePath = `/gs/${game.directory}/${game.image}`;
        const gamePath = `/gs/${game.directory}`;
        const gameId = `${game.directory}-${game.name}`;

        const gameLink = document.createElement('a');
        gameLink.href = '#';
        gameLink.addEventListener('click', (event) => {
            event.preventDefault();
        });

        const currentCount = favoriteCounts[game.directory] || 0;
        
        gameLink.innerHTML = `
            <div class="game-card-content">
                <img src="${imagePath}" alt="${game.name}" loading="lazy" crossorigin="anonymous">
                <div class="play-button">
                    <button class="play-btn">
                        <i class="fas fa-play"></i> Play Now
                    </button>
                </div>
                <div class="favorite-count" data-game-directory="${game.directory}">${currentCount} ⭐</div>
            </div>
            <h3>${game.name}</h3>
            <button class="favorite-btn" data-game-id="${gameId}">
                <i class="far fa-heart"></i>
            </button>
        `;

        const playButton = gameLink.querySelector('.play-btn');
        playButton.addEventListener('click', () => {
            openGamePage(gamePath, game.name);
        });

        const favoriteButton = gameLink.querySelector('.favorite-btn');
        favoriteButton.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleFavorite(game);
        });

        gameCard.appendChild(gameLink);
        fragment.appendChild(gameCard);

        setTimeout(() => {
            gameCard.classList.remove('game-card-hidden');
        }, index * 10);
    });

    gameList.appendChild(fragment);
    loadFavorites();
    updatePaginationControls();
}

function setupSearch(games) {
    const searchInput = document.getElementById('search');

    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.toLowerCase();
        const filteredGames = games.filter(game =>
            game.name.toLowerCase().includes(searchQuery)
        );
        displayGames(filteredGames);
        updateSearchPlaceholder(filteredGames.length);
    });
}

function updateSearchPlaceholder(totalGames) {
    const searchInput = document.getElementById('search');
    searchInput.setAttribute('placeholder', `Search through ${totalGames} Games...`);
}

function toggleFavorite(game) {
    const gameId = `${game.directory}-${game.name}`;
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const index = favorites.findIndex(fav => fav.id === gameId);
    if (index === -1) {
        game.id = gameId;
        favorites.push(game);
    } else {
        favorites.splice(index, 1);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtonState(gameId);
}

function updateFavoriteButtonState(gameId) {
    
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    favoriteButtons.forEach(button => {
        const buttonGameId = button.getAttribute('data-game-id');
        const icon = button.querySelector('i');

        const isFavorite = favorites.some(fav => fav.id === buttonGameId);

        if (isFavorite) {
            icon.classList.remove('far');
            icon.classList.add('fas');  
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far'); 
        }
    });
}

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    favorites.forEach(favorite => {
        updateFavoriteButtonState(favorite.id);
    });
}

function createPaginationControls() {
    const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-controls';
    paginationContainer.style.display = 'flex';
    paginationContainer.style.justifyContent = 'flex-end';
    paginationContainer.style.width = '100%';

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';  
    prevButton.className = 'pagination-btn';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayGames(filteredGames);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    const nextButton = document.createElement('button');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>'; 
    nextButton.className = 'pagination-btn';
    nextButton.disabled = currentPage >= totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayGames(filteredGames);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `${currentPage} - ${totalPages}`;

    paginationContainer.appendChild(prevButton);
    paginationContainer.appendChild(pageInfo);
    paginationContainer.appendChild(nextButton);

    return paginationContainer;
}

function updatePaginationControls() {
    const existingPagination = document.querySelector('.pagination-controls');
    if (existingPagination) {
        existingPagination.remove();
    }

    const paginationControls = createPaginationControls();
    
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.parentNode.insertBefore(paginationControls, searchInput);
    }
}

function openGamePage(gamePath, gameName) {
    window.location.href = `/gsl/loader.html?path=${encodeURIComponent(gamePath)}&name=${encodeURIComponent(gameName)}`;
}
