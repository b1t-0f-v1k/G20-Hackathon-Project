// InvestorDashboard.js
document.addEventListener("DOMContentLoaded", function() {
    // Initialize menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Initialize collapsible menus
    const collapsibles = document.getElementsByClassName('collapsible');
    for (let i = 0; i < collapsibles.length; i++) {
        collapsibles[i].addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Check for investor ID
    const sessionID = sessionStorage.getItem('newInvestorID');
    const urlParams = new URLSearchParams(window.location.search);
    const urlID = urlParams.get('investorID');
    const investorID = sessionID || urlID;
    
    if (investorID) {
        showInvestorIDPopup(investorID);
        sessionStorage.removeItem('newInvestorID');
        
        if (urlID) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // Initialize article carousel if container exists
    const articlesContainer = document.querySelector('.articles-container');
    if (articlesContainer) {
        initializeArticleCarousel();
    }
});

function toggleMenu() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.classList.toggle("collapsed");
    
    // Update main content margin
    const main = document.querySelector(".main");
    if (sidebar.classList.contains("collapsed")) {
        main.style.marginLeft = "80px";
    } else {
        main.style.marginLeft = "280px";
    }
}

function showInvestorIDPopup(investorID) {
    const popup = document.createElement('div');
    popup.className = 'investor-id-popup';
    popup.innerHTML = `
        <div class="popup-content">
            <h3>Your Investor ID</h3>
            <p class="investor-id">${investorID}</p>
            <p>Please save this ID for future reference</p>
            <button class="close-popup">OK</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    popup.querySelector('.close-popup').addEventListener('click', () => {
        document.body.removeChild(popup);
    });
}

async function initializeArticleCarousel() {
    const articlesContainer = document.querySelector('.articles-container');
    let currentIndex = 0;
    let slideInterval;
    const slideDuration = 8000;
    
    try {
        const response = await fetch('../articles/articles.json');
        if (!response.ok) throw new Error('Failed to load articles');
        const data = await response.json();
        const articles = data.articles;
        
        createCarousel(articles, articlesContainer);
        
        const prevBtn = document.createElement('button');
        prevBtn.className = 'nav-btn';
        prevBtn.id = 'prev-btn';
        prevBtn.textContent = 'Previous';
        
        const nextBtn = document.createElement('button');
        nextBtn.className = 'nav-btn';
        nextBtn.id = 'next-btn';
        nextBtn.textContent = 'Next';
        
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots-container';
        dotsContainer.id = 'dots-container';
        
        const navigation = document.createElement('div');
        navigation.className = 'navigation';
        navigation.appendChild(prevBtn);
        navigation.appendChild(nextBtn);
        
        articlesContainer.appendChild(navigation);
        articlesContainer.appendChild(dotsContainer);
        
        const cards = document.querySelectorAll('.news-card');
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
        
        function showCard(index) {
            cards.forEach(card => card.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            cards[index].classList.add('active');
            dots[index].classList.add('active');
            currentIndex = index;
            
            prevBtn.disabled = index === 0;
            nextBtn.disabled = index === cards.length - 1;
        }
        
        nextBtn.addEventListener('click', () => {
            if (currentIndex < cards.length - 1) {
                showCard(currentIndex + 1);
            }
            resetSlideTimer();
        });
        
        prevBtn.addEventListener('click', () => {
            if (currentIndex > 0) {
                showCard(currentIndex - 1);
            }
            resetSlideTimer();
        });
        
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
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
                showCard(currentIndex + 1);
                resetSlideTimer();
            } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
                showCard(currentIndex - 1);
                resetSlideTimer();
            }
        });
        
        prevBtn.disabled = true;
        if (cards.length <= 1) {
            nextBtn.disabled = true;
        }
        
        startSlideTimer();
        
        articlesContainer.addEventListener('mouseenter', () => {
            clearInterval(slideInterval);
        });
        
        articlesContainer.addEventListener('mouseleave', () => {
            startSlideTimer();
        });
        
    } catch (error) {
        console.error('Error loading articles:', error);
        articlesContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load news articles. Please try again later.</p>
                <p>${error.message}</p>
            </div>
        `;
    }
}

function createCarousel(articles, container) {
    articles.forEach((article, index) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.dataset.index = index;
        if (index === 0) card.classList.add('active');
        
        const title = document.createElement('h2');
        title.className = 'news-title';
        title.textContent = article.title;
        
        const image = document.createElement('img');
        image.className = 'news-image';
        image.src = article.image;
        image.alt = article.title;
        
        const content = document.createElement('div');
        content.className = 'news-content';
        article.content.forEach(paragraph => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            content.appendChild(p);
        });
        
        const date = document.createElement('div');
        date.className = 'news-date';
        date.textContent = article.date;
        
        const author = document.createElement('div');
        author.className = 'news-author';
        author.textContent = article.author;
        
        card.appendChild(title);
        card.appendChild(image);
        card.appendChild(content);
        card.appendChild(date);
        card.appendChild(author);
        
        container.appendChild(card);
    });
}

// Chatbot toggle functionality
document.addEventListener('DOMContentLoaded', function() {
  const chatbotToggle = document.getElementById('chatbotToggle');
  const chatbotContainer = document.getElementById('chatbotContainer');
  
  // Toggle chatbot visibility
  chatbotToggle.addEventListener('click', function() {
    chatbotContainer.classList.toggle('active');
  });
  
  // Close chatbot when clicking outside
  document.addEventListener('click', function(event) {
    if (!chatbotContainer.contains(event.target) && 
        event.target !== chatbotToggle && 
        !chatbotToggle.contains(event.target)) {
      chatbotContainer.classList.remove('active');
    }
  });
  
  // Prevent clicks inside chatbot from closing it
  chatbotContainer.addEventListener('click', function(event) {
    event.stopPropagation();
  });
});

// Quick ask function (needs to be global)
function quickAsk(question) {
  const input = document.getElementById('user-input');
  input.value = question;
  document.getElementById('send-btn').click();
}