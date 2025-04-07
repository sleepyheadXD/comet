document.addEventListener('DOMContentLoaded', () => {
    const cloakerToggle = document.getElementById('cloaker-toggle');
    let popup = null;
    let cloakerActivated = false;

    function activateCloaker() {
        if (cloakerActivated) return;
        cloakerActivated = true;

        if (window.top !== window) {
            window.top.postMessage({ type: 'activateCloaker' }, '*');
            return;
        }

        if (popup && !popup.closed) return;

        const storedTitle = localStorage.getItem('siteTitle') || "Home | Schoology";
        const storedFaviconURL = localStorage.getItem('faviconURL') || "https://bisd.schoology.com/sites/all/themes/schoology_theme/favicon.ico";
        const iframeSrc = "index.html";

        setTimeout(() => {
            popup = window.open("", "_blank");

            if (!popup || popup.closed) {
                return;
            }

            popup.document.head.innerHTML = `<title>${storedTitle}</title>
                                              <link rel="icon" href="${storedFaviconURL}">`;
            popup.document.body.innerHTML = `<iframe style="height: 100%; width: 100%; border: none; position: fixed; top: 0; right: 0; left: 0; bottom: 0;" 
                                                   src="${iframeSrc}"></iframe>`;

            if (!localStorage.getItem('cloakerRedirected')) {
                localStorage.setItem('cloakerRedirected', 'true');
                window.location.replace("https://bisd.schoology.com/");
            }
        }, 50);
    }

    function deactivateCloaker() {
        if (popup && !popup.closed) {
            popup.close();
        }
        cloakerActivated = false;
        localStorage.removeItem('cloakerRedirected');
    }

    function applySettings() {
        const cloakerEnabled = localStorage.getItem('cloakerEnabled');
        if (cloakerEnabled === 'true') {
            if (cloakerToggle) {
                cloakerToggle.checked = true;
            }
            activateCloaker();
        }
    }

    applySettings();

    if (cloakerToggle) {
        cloakerToggle.addEventListener('change', () => {
            const isEnabled = cloakerToggle.checked;
            localStorage.setItem('cloakerEnabled', isEnabled);
            if (isEnabled) {
                activateCloaker();
            } else {
                deactivateCloaker();
            }
        });
    }

    window.addEventListener('message', (event) => {
        if (event.data.type === 'activateCloaker') {
            activateCloaker();
        }
    });
});
