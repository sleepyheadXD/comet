function explodeStars(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const starsCount = 50; 
    
    for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        star.style.left = `${rect.left + rect.width / 2 - 4}px`; 
        star.style.top = `${rect.top + rect.height / 2 - 4}px`; 
        
        const angle = Math.random() * 2 * Math.PI; 
        const distance = Math.random() * 150 + 50; 
        const x = Math.cos(angle) * distance; 
        const y = Math.sin(angle) * distance; 

        star.style.setProperty('--x', `${x}px`);
        star.style.setProperty('--y', `${y}px`);
        
        star.style.animationDelay = `${Math.random() * 0.2}s`;
        
        document.body.appendChild(star);
        
        star.addEventListener('animationend', () => {
            star.remove();
        });
    }
}