// ==UserScript==
// @name         Pahe Stream
// @namespace    https://rizkym.my.id
// @version      4.5
// @description  Pahe + Stream | Note: Hold to Config (Lang, Autoplay, Autonext)
// @author       Rizky
// @match        https://pahe.ink/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Ambil Set Konfigurasi
    const getConfig = () => {
        const saved = localStorage.getItem('vidsrc_pahe_config');
        return saved ? JSON.parse(saved) : { 
            api: 'https://vidsrc-embed.ru', 
            lang: 'id', 
            autoplay: '1', 
            autonext: '1' 
        };
    };

    const setConfig = (config) => {
        localStorage.setItem('vidsrc_pahe_config', JSON.stringify(config));
    };

    // 2. UI Menu Konfigurasi (Long Press Trigger)
    const showConfigMenu = () => {
        const current = getConfig();
        const api = prompt("Base URL API:", current.api) || current.api;
        const lang = prompt("Bahasa Subtitle (ISO Code, misal: id, en):", current.lang) || current.lang;
        const autoplay = confirm("Aktifkan Autoplay?") ? "1" : "0";
        const autonext = confirm("Aktifkan Autonext?") ? "1" : "0";
        
        setConfig({ api, lang, autoplay, autonext });
        alert("Konfigurasi disimpan! Halaman akan reload.");
        location.reload();
    };

    const injectStream = () => {
        const imdbLink = document.querySelector('a.imdbwp__link');
        if (!imdbLink) return;
        const imdbId = imdbLink.href.match(/tt\d+/)?.[0];
        if (!imdbId) return;

        const codeBlocks = document.querySelectorAll('code');
        
        codeBlocks.forEach(code => {
            if (code.querySelector('.vidsrc-native') || !code.innerHTML.includes('Trailer')) return;

            const article = document.querySelector('article#the-post');
            const isSeries = article && (
                article.className.includes('tv-') || 
                !!document.querySelector('.post-cats a[href*="tv-"]')
            );

            // 3. Bangun URL dengan Parameter
            const config = getConfig();
            const type = isSeries ? 'tv' : 'movie';
            const streamUrl = `${config.api}/embed/${type}/${imdbId}?ds_lang=${config.lang}&autoplay=${config.autoplay}&autonext=${config.autonext}`;

            const br = document.createElement('br');
            const label = document.createTextNode('Stream .........: ');
            const link = document.createElement('a');
            
            link.className = 'vidsrc-native';
            link.href = streamUrl;
            link.target = '_blank';
            link.rel = "noreferrer";
            
            link.style.cssText = `
                color: #38E54D; 
                text-decoration: none; 
                font-family: "andale mono", "lucida console", monospace;
                font-size: 11px;
                font-weight: normal;
                line-height: normal;
                cursor: pointer;
                user-select: none;
            `;
            link.innerText = 'Play';

            // 4. Logika Hold / Long Press untuk buka Menu
            let timer;
            const startHold = () => {
                timer = setTimeout(() => {
                    timer = null;
                    showConfigMenu();
                }, 800);
            };

            const cancelHold = () => {
                if (timer) clearTimeout(timer);
            };

            link.addEventListener('mousedown', startHold);
            link.addEventListener('touchstart', startHold);
            link.addEventListener('mouseup', cancelHold);
            link.addEventListener('mouseleave', cancelHold);
            link.addEventListener('touchend', cancelHold);

            // Jalankan Stream
            link.onclick = (e) => {
                if (!timer && timer !== null) return; // Mencegah klik saat menu terbuka
                e.preventDefault();
                const win = window.open(link.href, '_blank');
                if (!win) window.location.href = link.href;
            };

            code.appendChild(br);
            code.appendChild(label);
            code.appendChild(link);
        });
    };

    const observer = new MutationObserver(injectStream);
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(injectStream, 1500);
})();
