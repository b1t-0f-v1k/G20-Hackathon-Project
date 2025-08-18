document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.news-card');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dotsContainer = document.getElementById('dots-container');
    let currentIndex = 0;
    let slideInterval;
    const slideDuration = 8000; // 8 seconds per slide
    
    // Create navigation dots
    cards.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            showCard(index);
            resetSlideTimer();
        });
        dotsContainer.appendChild(dot);
    });
    
    const dots = document.querySelectorAll('.dot');
    
    // Show specific card
    function showCard(index) {
        cards.forEach(card => card.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        cards[index].classList.add('active');
        dots[index].classList.add('active');
        currentIndex = index;
        
        // Update button states
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === cards.length - 1;
    }
    
    // Next button click
    nextBtn.addEventListener('click', () => {
        if (currentIndex < cards.length - 1) {
            showCard(currentIndex + 1);
        }
        resetSlideTimer();
    });
    
    // Previous button click
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
            showCard(currentIndex - 1);
        }
        resetSlideTimer();
    });
    
    // Auto-advance slides
    function startSlideTimer() {
        slideInterval = setInterval(() => {
            const nextIndex = (currentIndex + 1) % cards.length;
            showCard(nextIndex);
        }, slideDuration);
    }
    
    function resetSlideTimer() {
        clearInterval(slideInterval);
        startSlideTimer();
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
            showCard(currentIndex + 1);
            resetSlideTimer();
        } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
            showCard(currentIndex - 1);
            resetSlideTimer();
        }
    });
    
    // Initialize button states
    prevBtn.disabled = true;
    if (cards.length <= 1) {
        nextBtn.disabled = true;
    }
    
    // Start auto-slideshow
    startSlideTimer();
    
    // Pause on image hover
    const newsImages = document.querySelectorAll('.news-image');
    newsImages.forEach(image => {
        image.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        image.addEventListener('mouseleave', () => {
            startSlideTimer();
        });
    });
    
    // Pause on card hover
    const container = document.querySelector('.container');
    container.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });
    
    container.addEventListener('mouseleave', () => {
        startSlideTimer();
    });
});