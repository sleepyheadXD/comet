let database;

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
        
        loadFavorites();
    } catch (error) {
        console.error('Error initializing Firebase:', error);
    }
});

function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    const favoriteList = document.getElementById('favorite-list');
    favoriteList.innerHTML = ''; 

    if (favorites.length === 0) {
        const noFavoritesMessage = document.createElement('p');
        noFavoritesMessage.className = 'no-favorites-message';
        noFavoritesMessage.textContent = "You haven't favorited any games yet. Favorite some to see them here!";
        favoriteList.appendChild(noFavoritesMessage);
    } else {
        const fragment = document.createDocumentFragment();

        favorites.forEach(game => {
            const imagePath = `/gs/${game.directory}/${game.image}`;
            const gamePath = `/gs/${game.directory}`;

            const gameCard = document.createElement('div');
            gameCard.className = 'game-card';

            const gameLink = document.createElement('a');
            gameLink.href = '#';
            gameLink.addEventListener('click', (event) => {
                event.preventDefault(); 
            });

            gameLink.innerHTML = `
                <div class="game-card-content">
                    <img src="${imagePath}" alt="${game.name}" loading="lazy">
                    <div class="play-button">
                        <button class="play-btn">
                          <i class="fas fa-play"></i> Play Now
                        </button>
                    </div>
                </div>
                <button class="remove-btn" data-game-id="${game.id}">
                    <i class="fas fa-times"></i>
                </button>
                <h3>${game.name}</h3>
            `;

            const playButton = gameLink.querySelector('.play-btn');
            playButton.addEventListener('click', () => {
                openGamePage(gamePath, game.name);
            });

            const removeButton = gameLink.querySelector('.remove-btn');
            removeButton.addEventListener('click', (event) => {
                event.stopPropagation();
                removeFavorite(game);
            });

            gameCard.appendChild(gameLink);
            fragment.appendChild(gameCard);
        });

        favoriteList.appendChild(fragment);
    }
}

async function removeFavorite(game) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const index = favorites.findIndex(fav => fav.id === game.id);

    if (index !== -1) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));

        if (window.showGameNotification) {
            window.showGameNotification(`${game.name} was removed from Your Favorites!`, 'error');
        }

        try {
            const { ref, get, set } = await import('https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js');
            const gameRef = ref(database, `gamesFavorites/${game.directory}`);
            
            const snapshot = await get(gameRef);
            let currentCount = snapshot.val() || 0;
            currentCount = Math.max(0, currentCount - 1); 
            
            await set(gameRef, currentCount);
        } catch (error) {
            console.error('Error updating favorite count:', error);
        }
    }

    loadFavorites();
}

function openGamePage(gamePath, gameName) {
    window.location.href = `/gsl/loader.html?path=${encodeURIComponent(gamePath)}&name=${encodeURIComponent(gameName)}`;
}

