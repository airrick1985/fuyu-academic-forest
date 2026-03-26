/* js/birds.js */
(() => {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    // Prevent multiple initializations during PJAX
    if (heroContent.querySelector('.birds-container')) return;

    const birdsContainer = document.createElement('div');
    birdsContainer.className = 'birds-container';
    // Position exactly in the center of the hero section
    birdsContainer.style.position = 'absolute';
    birdsContainer.style.top = '40%';
    birdsContainer.style.left = '50%';
    birdsContainer.style.width = '0';
    birdsContainer.style.height = '0';
    birdsContainer.style.zIndex = '1'; // Behind the logo text
    birdsContainer.style.pointerEvents = 'none';
    heroContent.appendChild(birdsContainer);

    const numBirds = 5; // Number of birds at any time

    function spawnBird() {
        if (!document.querySelector('.birds-container')) return; // Safety check if page changed

        const bird = document.createElement('div');
        bird.classList.add('bird');

        // Limit bird radius so they spawn closer to the logo
        const angle = Math.random() * Math.PI * 2;
        const radiusX = 150 + Math.random() * 250;
        const radiusY = 100 + Math.random() * 150;

        const startX = Math.cos(angle) * radiusX;
        const startY = Math.sin(angle) * radiusY;

        // Target position (fly across and drift slightly up or down)
        // Ensure they fly forward by adding to the X axis
        const directionX = Math.random() > 0.5 ? 1 : -1;
        const endX = startX + (directionX * (150 + Math.random() * 200));
        const endY = startY - (100 + Math.random() * 100); // Generally fly upwards

        // Determine if bird needs to be flipped based on flying direction
        const flip = directionX === -1 ? 'scaleX(-1)' : '';

        // Custom scale for distance parallax (0.4 to 1)
        const scale = 0.4 + Math.random() * 0.6;

        // Duration 12 to 20 seconds for slow, majestic flight
        const duration = 12000 + Math.random() * 8000;

        birdsContainer.appendChild(bird);

        const anim = bird.animate([
            { transform: `translate(${startX}px, ${startY}px) scale(${scale}) ${flip}`, opacity: 0 },
            { transform: `translate(${(startX + endX) / 2}px, ${(startY + endY) / 2 - 50}px) scale(${scale}) ${flip}`, opacity: 0.6, offset: 0.5 },
            { transform: `translate(${endX}px, ${endY}px) scale(${scale}) ${flip}`, opacity: 0 }
        ], {
            duration: duration,
            easing: 'ease-in-out'
        });

        anim.onfinish = () => {
            bird.remove();
            spawnBird(); // Spawn a new one to maintain population
        };
    }

    // Cascade spawning so they don't appear all at once
    for (let i = 0; i < numBirds; i++) {
        setTimeout(spawnBird, Math.random() * 8000);
    }
})();
