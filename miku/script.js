/**
 * Miku Interactive Visualizer - Local Audio & Dynamic Images
 * Author: GitHub Copilot
 *
 * This script handles:
 * 1. HTML5 <audio> element for background audio playback from a local file.
 * 2. Syncing a custom progress bar with the audio, shown only on relevant pages.
 * 3. Dynamically loading random images from a structured, categorized list on page load.
 * 4. Mouse-driven animations and a custom cursor.
 * 5. Autoplay handling with a user-friendly prompt.
 */

(function() {
    'use strict';

    // --- DYNAMIC IMAGE ASSETS (User-provided list) ---
    const MIKU_IMAGE_GALLERY = [
        'https://static.wikitide.net/projectsekaiwiki/5/54/Miku_3_art.png',
        'https://static.wikitide.net/projectsekaiwiki/a/a9/Miku_1_cutout.png',
        'https://static.wikitide.net/projectsekaiwiki/2/20/Miku_38_art.png',
        'https://static.wikitide.net/projectsekaiwiki/9/9f/Miku_38_cutout.png',
        'https://static.wikitide.net/projectsekaiwiki/1/15/Default_21_%28front%29.png',
        'https://static.wikitide.net/projectsekaiwiki/c/cf/Charsel-original-miku.png',
        'https://static.wikitide.net/projectsekaiwiki/4/40/Miku-circle.png',
        'https://static.wikitide.net/projectsekaiwiki/d/d3/Charsel-miku.png',
        'https://static.wikitide.net/projectsekaiwiki/6/64/Miku_25_cutout.png',
        'https://static.wikitide.net/projectsekaiwiki/5/54/Miku_3_art.png',
        'https://static.wikitide.net/projectsekaiwiki/a/a9/Miku_1_cutout.png',
        'https://static.wikitide.net/projectsekaiwiki/2/20/Miku_38_art.png',
        'https://static.wikitide.net/projectsekaiwiki/9/9f/Miku_38_cutout.png',
        'https://static.wikitide.net/projectsekaiwiki/1/15/Default_21_%28front%29.png',
        'https://static.wikitide.net/projectsekaiwiki/c/cf/Charsel-original-miku.png',
        'https://static.wikitide.net/projectsekaiwiki/4/40/Miku-circle.png',
        'https://static.wikitide.net/projectsekaiwiki/d/d3/Charsel-miku.png',
        'https://static.wikitide.net/projectsekaiwiki/6/64/Miku_25_cutout.png',
        'https://static.wikitide.net/projectsekaiwiki/d/d3/Charsel-miku.png',
        'https://static.wikitide.net/projectsekaiwiki/6/64/Miku_25_cutout.png'
    ];

    // --- DOM ELEMENTS ---
    const audio = document.getElementById('background-audio');
    const loadingOverlay = document.getElementById('loading-overlay');
    const mikuSwayContainer = document.querySelector('.miku-sway-container');
    const playToggleButton = document.getElementById('playToggle');
    const muteToggleButton = document.getElementById('muteToggle');
    const iconMuted = document.getElementById('icon-muted');
    const iconUnmuted = document.getElementById('icon-unmuted');
    const pageWrap = document.getElementById('pageWrap');
    const visualizerCanvas = document.getElementById('visualizer-canvas');
    
    const backgrounds = {
        hero: document.getElementById('hero-bg'),
        conveyor: document.getElementById('conveyor-bg'),
        charging: document.getElementById('charging-bg'),
        showcase: document.getElementById('showcase-bg'),
        player: document.getElementById('player-bg'),
    };

    const mikuImages = {
        main: document.getElementById('miku-visual'),
        falling: document.getElementById('falling-miku'),
        charging: document.getElementById('charging-miku'),
        showcase: document.getElementById('showcase-miku'),
        albumArt: document.getElementById('album-art'),
    };
    
    // Old manual outfit buttons removed — replaced by auto-cycling showcase with indicators

    // --- STATE ---
    let isUserSeeking = false;
    let mouseX = 0;
    let mouseY = 0;
    let audioContext;
    let analyser;
    let source;
    let dataArray;

    // --- UTILITY FUNCTIONS ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    }

    // --- INITIAL SETUP (IMPROVED LOGIC) ---
    function setupDynamicAssets() {
        // 1. Remove duplicates and get a clean list of unique images
        const uniqueImages = [...new Set(MIKU_IMAGE_GALLERY)];

        // 2. Categorize images into "cutouts" (for characters) and "art" (for backgrounds)
        const cutoutImages = uniqueImages.filter(url => url.includes('cutout') || url.includes('char') || url.includes('front'));
        const artImages = uniqueImages.filter(url => url.includes('art') || url.includes('circle'));

        // Ensure we have enough images, fallback to the full list if a category is empty
        const characterPool = shuffleArray(cutoutImages.length > 0 ? cutoutImages : uniqueImages);
        const backgroundPool = shuffleArray(artImages.length > 0 ? artImages : uniqueImages);

        // 3. Assign images with a clear, structured logic
        // Assign character images
        mikuImages.main.src = characterPool[0 % characterPool.length];
        mikuImages.falling.src = characterPool[1 % characterPool.length];
        mikuImages.charging.src = characterPool[2 % characterPool.length];
        mikuImages.showcase.src = characterPool[3 % characterPool.length];
        
        // Assign UI and album art
        mikuImages.albumArt.src = backgroundPool[0 % backgroundPool.length]; // Use an art image for album cover

        // Assign background images
        Object.values(backgrounds).forEach((bg, index) => {
            const imgUrl = backgroundPool[(index + 1) % backgroundPool.length]; // Start from index 1 of backgroundPool
            bg.style.backgroundImage = `linear-gradient(rgba(2, 3, 10, 0.7), rgba(2, 3, 10, 0.9)), url('${imgUrl}')`;
        });
        
        console.log("Dynamic assets loaded with structured logic.");
    }

    // --- AUDIO & PLAYER CONTROLS ---
    function setupAudioVisualizer() {
        if (audioContext) return; // Already set up
        console.log("Setting up Audio Visualizer for the first time.");
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create the source node from the <audio> element
        source = audioContext.createMediaElementSource(audio);
        
        // Create the analyser node
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        // CRITICAL FIX: Connect source to BOTH analyser (for data) and destination (for sound)
        source.connect(analyser);
        source.connect(audioContext.destination);
        
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        console.log("Audio graph corrected: Source -> Analyser AND Source -> Destination");
    }

    function handleFirstGesture() {
        // Prevent this from running multiple times
        window.removeEventListener('click', handleFirstGesture);
        window.removeEventListener('touchstart', handleFirstGesture);
        window.removeEventListener('keydown', handleFirstGesture);

        loadingOverlay.style.opacity = 0;
        setTimeout(() => { loadingOverlay.style.display = 'none'; }, 500);

        if (!audioContext) {
            setupAudioVisualizer();
        }

        // Resume AudioContext and play audio *after* it's successfully resumed.
        // This is the most robust way to handle browser autoplay policies.
        if (audioContext.state === 'suspended') {
            audioContext.resume().then(() => {
                console.log("AudioContext resumed successfully.");
                playAudio();
            }).catch(error => {
                console.error("AudioContext resume failed:", error);
            });
        } else {
            playAudio();
        }
    }

    function playAudio() {
        // Set the start time first, then play. This is more reliable.
        audio.currentTime = 18; // Start at 0:18
        audio.play().then(() => {
            console.log("Audio playback started after user gesture.");
            updateMuteButton(false);
            audio.muted = false;
        }).catch(error => {
            console.error("Audio playback failed:", error);
        });
    }

    function togglePlayback() {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    }

    function updateMuteButton(isMuted) {
        iconMuted.style.display = isMuted ? 'block' : 'none';
        iconUnmuted.style.display = isMuted ? 'none' : 'block';
        audio.muted = isMuted;
    }

    // --- PROGRESS BAR VISIBILITY ---
    // This logic is no longer needed as the visualizer is always visible.
    /*
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const showPlayer = entry.target.dataset.showPlayer === 'true';
                progressBarContainer.classList.toggle('visible', showPlayer);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
    */

    // --- EVENT LISTENERS ---
    window.addEventListener('load', setupDynamicAssets);
    window.addEventListener('click', handleFirstGesture);
    window.addEventListener('touchstart', handleFirstGesture);
    window.addEventListener('keydown', handleFirstGesture);

    playToggleButton.addEventListener('click', togglePlayback);
    document.querySelector('.aplayer-btn.play').addEventListener('click', togglePlayback);

    audio.addEventListener('play', () => {
        playToggleButton.textContent = '⏸';
        document.querySelector('.aplayer-btn.play').textContent = '⏸';
    });

    audio.addEventListener('pause', () => {
        playToggleButton.textContent = '▶';
        document.querySelector('.aplayer-btn.play').textContent = '▶';
    });

    // No longer need timeupdate/loadedmetadata for the old progress bar
    // audio.addEventListener('timeupdate', ...);
    // audio.addEventListener('loadedmetadata', ...);

    muteToggleButton.addEventListener('click', () => {
        updateMuteButton(!audio.muted);
    });

    // Old progress bar listeners removed
    // progressBar.addEventListener(...);

    // Old outfit switcher logic removed
    
    window.addEventListener('mousemove', e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // --- ANIMATION LOOP ---
    function drawVisualizer() {
        if (!audioContext || !analyser || !dataArray) return;

        analyser.getByteFrequencyData(dataArray);
        const canvas = visualizerCanvas;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyser.frequencyBinCount;

        canvas.width = window.innerWidth;
        canvas.height = 150;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] * 0.5;

            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, 'rgba(0, 194, 255, 0.8)');
            gradient.addColorStop(1, 'rgba(255, 107, 214, 0.5)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 2;
        }

        // Draw progress line
        const progress = (audio.currentTime / audio.duration) * canvas.width;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(0, canvas.height - 2, progress, 2);
        
        // Draw time labels
        const currentTimeStr = formatTime(audio.currentTime);
        const durationStr = formatTime(audio.duration || 0);
        ctx.font = '14px Poppins, sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillText(currentTimeStr, 10, canvas.height - 10);
        ctx.textAlign = 'right';
        ctx.fillText(durationStr, canvas.width - 10, canvas.height - 10);
    }

    function animate() {
        requestAnimationFrame(animate);

        const currentTime = audio.currentTime || 0;

        const swayX = -mouseX * 30;
        const swayY = -mouseY * 15;
        const rotation = mouseX * 8;
        mikuSwayContainer.style.transform = `translate(${swayX}px, ${swayY}px) rotate(${rotation}deg)`;

        const pulse = 1 + Math.sin(currentTime * Math.PI) * 0.02;
        mikuSwayContainer.style.transform += ` scale(${pulse})`; // Combine transforms

        const scrollPercent = pageWrap.scrollTop / (pageWrap.scrollHeight - window.innerHeight);
        Object.values(backgrounds).forEach(bg => {
            bg.style.transform = `scale(1.1) translateY(${scrollPercent * -100}px)`;
        });

        drawVisualizer();
    }
    
    // Start the animation loop
    requestAnimationFrame(animate);

})();