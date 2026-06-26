const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('index.html', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable", url: "file:///D:/Ball/Vellox/index.html" });

dom.window.addEventListener('error', (e) => {
    console.error('Window Error:', e.error);
});

dom.window.document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        try {
            console.log('DOM loaded. Finding class cards...');
            const cards = dom.window.document.querySelectorAll('.class-card');
            console.log('Cards found:', cards.length);
            
            if (cards.length > 0) {
                console.log('Clicking first card...');
                cards[0].click();
                
                const btn = dom.window.document.getElementById('btn-start-run');
                console.log('Start button visibility:', btn.classList.contains('hidden') ? 'hidden' : 'visible');
                
                console.log('Clicking start button...');
                btn.click();
                
                console.log('Current view after click:', dom.window.document.getElementById('view-board').classList.contains('hidden') ? 'still hidden' : 'visible!');
            }
        } catch (err) {
            console.error('Test error:', err);
        }
    }, 1000);
});
