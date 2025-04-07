let fpsCounterElement = document.getElementById("fps-counter");
let frameCount = 0;
let lastTime = performance.now();
let currentFPS = 0;
let targetFPS = 0;
let smoothingFactor = 0.1; 
let fpsHistory = []; 
let maxHistoryLength = 60;
let averageFPS = 0;

let ping = 0;

function getPing(url = window.location.href) {  // Use the current page URL by default
    const start = Date.now();

    fetch(url, { method: 'HEAD', cache: 'no-store' })
        .then(response => {
            const latency = Date.now() - start;
            ping = latency;
        })
        .catch(error => {
            ping = -1; 
        });
}

function updateFPS() {
    frameCount++;
    let currentTime = performance.now();
    let deltaTime = (currentTime - lastTime) / 1000; 

    if (deltaTime >= 0.1) {  
        targetFPS = Math.round(frameCount / deltaTime);  
        frameCount = 0;
        lastTime = currentTime;

        fpsHistory.push(targetFPS);

        if (fpsHistory.length > maxHistoryLength) {
            fpsHistory.shift(); 
        }

        let sum = fpsHistory.reduce((a, b) => a + b, 0);
        averageFPS = sum / fpsHistory.length;
    }

    currentFPS += (targetFPS - currentFPS) * smoothingFactor;

    let pingText = (ping !== -1) ? `Ping: ${ping} ms` : 'Ping: Error';
    fpsCounterElement.innerHTML = `  
        FPS: ${Math.round(currentFPS)}<br>
        Average FPS: ${Math.round(averageFPS)}<br>
        ${pingText}
    `;

    requestAnimationFrame(updateFPS);
}

setInterval(() => getPing(), 1000);

updateFPS();
