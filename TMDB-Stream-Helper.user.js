// ==UserScript==
// @name         TMDB Stream Helper
// @namespace    https://rizkym.my.id
// @version      1.4
// @description  Stream button (Menu konfigurasi Hold to Config)
// @author       Rizky
// @match        https://www.themoviedb.org/movie/*
// @match        https://www.themoviedb.org/tv/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 1. Ambil/Set Konfigurasi
    const getConfig = () => {
        const saved = localStorage.getItem('tmdb_stream_config');
        return saved ? JSON.parse(saved) : { lang: 'en', autoplay: '1', autonext: '0' };
    };

    const setConfig = (config) => {
        localStorage.setItem('tmdb_stream_config', JSON.stringify(config));
    };

    const getStreamUrl = () => {
        const config = getConfig();
        const path = window.location.pathname.split('/');
        const type = path[1];
        const id = path[2].split('-')[0];
        
        let baseUrl = "";
        let params = `?ds_lang=${config.lang}&autoplay=${config.autoplay}`;

        if (type === 'movie') {
            baseUrl = `https://vidsrc-embed.ru/embed/movie/${id}`;
        } else if (type === 'tv') {
            if (path[3] === 'season' && path[5] === 'episode') {
                baseUrl = `https://vidsrc-embed.ru/embed/tv/${id}/${path[4]}-${path[6]}`;
                params += `&autonext=${config.autonext}`;
            } else {
                baseUrl = `https://vidsrc-embed.ru/embed/tv/${id}`;
            }
        }
        return baseUrl + params;
    };

    // 2. UI Menu Konfigurasi
    const showConfigMenu = () => {
        const current = getConfig();
        const lang = prompt("Bahasa Subtitle (ISO Code, misal: id, en, de):", current.lang) || current.lang;
        const autoplay = confirm("Aktifkan Autoplay?") ? "1" : "0";
        const autonext = confirm("Aktifkan Autonext (khusus TV)?") ? "1" : "0";
        
        setConfig({ lang, autoplay, autonext });
        alert("Konfigurasi disimpan!");
    };

    // 3. Inject Tombol
    const injectButton = () => {
        const container = document.querySelector('.image_content');
        if (!container || document.querySelector('#vidsrc-stream-btn')) return;

        container.style.position = 'relative';

        const btn = document.createElement('button');
        btn.id = 'vidsrc-stream-btn';
        btn.innerHTML = 'STREAM NOW';
        btn.style.cssText = `
            position: absolute;
            bottom: 10px;
            right: 10px;
            z-index: 999;
            padding: 8px 15px;
            background: linear-gradient(135deg, #01b4e4 0%, #90cea1 100%);
            color: #081c22;
            border: 2px solid #fff;
            border-radius: 20px;
            cursor: pointer;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.5);
            transition: transform 0.1s;
        `;

        // Logika Hold / Long Press
        let timer;
        const holdTime = 800; // 0.8 detik buat buka config

        btn.addEventListener('mousedown', (e) => {
            timer = setTimeout(() => {
                timer = null;
                showConfigMenu();
            }, holdTime);
        });

        btn.addEventListener('mouseup', () => {
            if (timer) {
                clearTimeout(timer);
                window.open(getStreamUrl(), '_blank');
            }
        });

        btn.addEventListener('touchstart', (e) => {
            timer = setTimeout(() => {
                timer = null;
                showConfigMenu();
            }, holdTime);
        });

        btn.addEventListener('touchend', (e) => {
            if (timer) {
                clearTimeout(timer);
                window.open(getStreamUrl(), '_blank');
            }
        });

        container.appendChild(btn);
    };

    setTimeout(injectButton, 1000);
    
    let lastUrl = location.href;
    new MutationObserver(() => {
        if (location.href !== lastUrl) {
            lastUrl = location.href;
            setTimeout(injectButton, 1000);
        }
    }).observe(document.body, { childList: true, subtree: true });

})();
