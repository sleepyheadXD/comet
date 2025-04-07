class GameNotifications {
    constructor() {
        this.createNotificationContainer();
    }

    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(container);
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'toast-notification';
        notification.style.cssText = `
            padding: 16px 24px;
            margin-bottom: 10px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease-in-out;
            display: flex;
            align-items: center;
            gap: 8px;
            backdrop-filter: blur(15px);
            cursor: pointer;
        `;

        notification.style.background = type === 'success' 
            ? 'rgba(30, 30, 30, 0.377)'
            : 'rgba(30, 30, 30, 0.377)';

        const icon = type === 'success' ? '🤍' : '☹️';
        notification.innerHTML = `${icon} ${message}`;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);

        notification.addEventListener('click', () => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
}

let gameNotifications;

document.addEventListener('DOMContentLoaded', () => {
    gameNotifications = new GameNotifications();
    
    window.addEventListener('storage', (e) => {
        if (e.key === 'favorites') {
            const oldFavorites = JSON.parse(e.oldValue || '[]');
            const newFavorites = JSON.parse(e.newValue || '[]');
            
            if (newFavorites.length > oldFavorites.length) {
                const newGame = newFavorites.find(game => 
                    !oldFavorites.some(old => old.id === game.id)
                );
                if (newGame) {
                    gameNotifications.showNotification(`${newGame.name} a`, 'success');
                }
            } else if (newFavorites.length < oldFavorites.length) {
                const removedGame = oldFavorites.find(game => 
                    !newFavorites.some(current => current.id === game.id)
                );
                if (removedGame) {
                    gameNotifications.showNotification(`${removedGame.name} a`, 'error');
                }
            }
        }
    });
});

window.gameNotifications = gameNotifications;

window.showGameNotification = (message, type) => {
    if (gameNotifications) {
        gameNotifications.showNotification(message, type);
    }
};
