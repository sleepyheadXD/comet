document.addEventListener('DOMContentLoaded', function () {
    const sidebarHTML = `
        <nav class="sidebar1">
            <section>
                <ul>
                    <li><a href="/home.html" class="sidebar-active" data-iframe-link><i class="fas fa-home"></i>Home</a></li>
                    <li id="sidebar-search-trigger" class="sidebar-link"><i class="fas fa-search"></i>Search</li>
                </ul>
            </section>
        </nav>

        <nav class="sidebar2">
            <section>
                <ul>
                    <li><a href="/gs.html" class="sidebar-active" data-iframe-link><i class="fas fa-gamepad"></i>Games</a></li>
                </ul>
            </section>

            <section>
                <ul>
                    <li><a href="/apps.html" class="sidebar-active" data-iframe-link><i class="fas fa-th-large"></i>Apps</a></li>
                </ul>
            </section>
        </nav>

        <nav class="sidebar3">
            <section>
                <ul>
                    <li><a href="/favorites.html" id="favorites-link" class="sidebar-active" data-iframe-link><i class="far fa-heart"></i>Favorites</a></li>
                </ul>
            </section>    
            <section>
                <ul>
                    <li><a href="/info.html" class="sidebar-active" data-iframe-link><i class="fas fa-info-circle"></i>Info</a></li>
                </ul>
            </section>
            <section>
                <ul>
                    <li><a href="/settings.html" class="sidebar-active" data-iframe-link><i class="fas fa-cog"></i>Settings</a></li>
                </ul>
            </section>
        </nav>

        <div id="content-iframe-container">
            <iframe id="content-iframe"></iframe>
        </div>
    `;

    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('afterbegin', sidebarHTML);
    }

    const iframe = document.getElementById('content-iframe');

    function updateActiveSidebarLink(path) {
        document.querySelectorAll('[data-iframe-link]').forEach(el => {
            el.classList.remove('on');

            if (el.id === 'favorites-link') {
                const icon = el.querySelector('i');
                if (icon) {
                    icon.classList.remove('fas', 'fa-heart');
                    icon.classList.add('far', 'fa-heart');

                    if (el.getAttribute('href') === path) {
                        icon.classList.remove('far', 'fa-heart');
                        icon.classList.add('fas', 'fa-heart');
                    }
                }
            }

            if (el.getAttribute('href') === path) {
                el.classList.add('on');
            }
        });
    }

    const observer = new MutationObserver(() => {
        const path = '/' + iframe.src.split('/').pop();
        localStorage.setItem('lastIframe', path); 
        updateActiveSidebarLink(path);
    });

    observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });

    iframe.addEventListener('load', () => {
        const path = '/' + iframe.src.split('/').pop();
        localStorage.setItem('lastIframe', path); 
        updateActiveSidebarLink(path);
    });

    document.querySelectorAll('[data-iframe-link]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newSrc = link.getAttribute('href');
            iframe.src = newSrc;
            localStorage.setItem('lastIframe', newSrc); 
        });
    });

    function updateVH() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    updateVH();
    window.addEventListener('resize', updateVH);

    const lastIframe = localStorage.getItem('lastIframe') || '/home.html';
    iframe.src = lastIframe;
    updateActiveSidebarLink(lastIframe);

    window.addEventListener('message', (event) => {
        if (event.data.type === 'redirectToBisd') {
            window.location.replace("https://bisd.schoology.com/");
        }
    });
});
