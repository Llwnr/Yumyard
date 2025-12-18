// ==========================================
// FIXED LOGIC SECTION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Menu Data
    if(typeof menuData !== 'undefined'){
        Papa.parse(menuData, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                initApp(results.data);
            },
            error: function(err) {
                console.error("Error parsing CSV:", err);
                document.getElementById('menu-container').innerHTML = '<div class="text-center py-10"><p class="text-red-500 font-bold">Failed to load menu.</p></div>';
            }
        });
    }

    // 2. Navbar Scroll Logic (Hides/Shows main navbar)
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if(scrollTop > 100) {
            navbar.classList.add('shadow-md');
            // Hide navbar on scroll down, show on scroll up
            if (scrollTop > lastScrollTop && scrollTop > 300) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.classList.remove('shadow-md');
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // 3. Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    if(mobileBtn) {
        mobileBtn.addEventListener('click', () => {
            const menuSection = document.getElementById('menu-section');
            if(menuSection) {
                menuSection.scrollIntoView({behavior: 'smooth'});
            }
        });
    }
});

function initApp(items) {
    // Clean data
    items = items.filter(i => i.Item && i.Item.trim() !== "");

    // Group data
    const grouped = items.reduce((acc, item) => {
        const cat = item.Category ? item.Category.trim() : 'Specials';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    renderSidebar(Object.keys(grouped));
    renderMenuGrid(grouped);
    initScrollSpy();
}

function renderSidebar(categories) {
    const navContainer = document.getElementById('category-nav');
    if(!navContainer) return;
    
    navContainer.innerHTML = '';

    categories.forEach((cat) => {
        const li = document.createElement('li');
        li.className = "flex-shrink-0"; 
        
        const catId = cat.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

        const btn = document.createElement('button');
        // z-index note: The parent container in HTML likely needs z-40 to sit below navbar (z-50) but above content
        btn.className = `
            category-link
            px-5 py-2 rounded-full font-bold text-sm transition-all duration-200
            border border-gray-200 bg-white text-gray-600
            whitespace-nowrap shadow-sm
        `;
        btn.dataset.target = catId;
        btn.textContent = cat;

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = document.getElementById(catId);
            if(targetSection) {
                // Calculate Offset
                // We need space for: Main Navbar (80px) + Category Bar (approx 60px)
                const offset = 140; 
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = targetSection.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });

        li.appendChild(btn);
        navContainer.appendChild(li);
    });
}

function renderMenuGrid(groupedItems) {
    const container = document.getElementById('menu-container');
    if(!container) return;
    
    container.innerHTML = '';

    for (const [category, items] of Object.entries(groupedItems)) {
        const catId = category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

        const section = document.createElement('section');
        section.id = catId;
        // Added scroll-mt to help with CSS scroll snapping if JS fails
        section.className = "scroll-mt-40 mb-12 category-section w-full";

        // HEADER
        const header = document.createElement('div');
        // IMPORTANT: Removed 'sticky' and negative margins (-mx) to fix the "Cut off" text issue
        header.className = "flex items-center gap-3 mb-6 pt-4 border-t border-gray-100 lg:border-0";
        header.innerHTML = `
            <div class="w-1.5 h-8 bg-brand-yellow rounded-r-lg"></div>
            <h2 class="text-3xl font-black text-brand-black uppercase tracking-tight">${category}</h2>
        `;

        // GRID
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6 w-full";

        items.forEach(item => {
            const card = document.createElement('div');
            // IMPORTANT: 'flex-col' ensures Image is TOP, Text is BOTTOM on mobile. 
            // 'w-full' ensures it fits the container.
            card.className = "group w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row gap-0 md:gap-4 hover:shadow-lg transition-shadow duration-300";
            
            const imgSrc = item.Image && item.Image.trim() !== '' ? item.Image : null;

            let imgHTML = '';
            if(imgSrc) {
                // Mobile: h-48 (landscape), Desktop: w-40 (square-ish)
                imgHTML = `
                    <div class="w-full h-48 md:w-40 md:h-auto flex-shrink-0 relative overflow-hidden bg-gray-100">
                        <img src="${imgSrc}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="${item.Item}">
                    </div>
                `;
            }

            card.innerHTML = `
                ${imgHTML}
                <div class="p-4 flex flex-col justify-between flex-grow min-w-0">
                    <div>
                        <div class="flex justify-between items-start gap-2 mb-2">
                            <h4 class="font-bold text-lg text-brand-black leading-tight">${item.Item}</h4>
                            <span class="font-black text-brand-yellow text-lg whitespace-nowrap">${item.Price}</span>
                        </div>
                        <p class="text-gray-500 text-sm line-clamp-2 leading-relaxed">${item.Description}</p>
                    </div>
                    
                    <div class="mt-4 pt-3 border-t border-gray-50 flex justify-end">
                        <button class="text-xs font-bold bg-brand-black text-white px-4 py-2 rounded-lg hover:bg-brand-yellow hover:text-brand-black transition-colors uppercase tracking-wider">
                            Add to Order
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        section.appendChild(header);
        section.appendChild(grid);
        container.appendChild(section);
    }
}

function initScrollSpy() {
    const sections = document.querySelectorAll('.category-section');
    const navLinks = document.querySelectorAll('.category-link');
    const navContainer = document.getElementById('category-nav');

    // 1. Observer to highlight active link
    const observerOptions = {
        root: null,
        // Trigger when the section is near the middle/top of viewport
        rootMargin: '-20% 0px -60% 0px', 
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active classes
                navLinks.forEach(link => {
                    link.classList.remove('active-category', 'text-brand-black', 'border-brand-black');
                    link.classList.add('text-gray-600', 'border-gray-200');
                });

                // Add active classes
                const activeId = entry.target.id;
                const activeLink = document.querySelector(`.category-link[data-target="${activeId}"]`);
                
                if (activeLink) {
                    activeLink.classList.remove('text-gray-600', 'border-gray-200');
                    activeLink.classList.add('active-category', 'text-brand-black');
                    
                    // 2. Horizontal Scroll Logic for the sticky bar
                    // Scrolls the sidebar automatically to keep the active button in view
                    const containerRect = navContainer.getBoundingClientRect();
                    const linkRect = activeLink.getBoundingClientRect();
                    
                    // Calculate center position
                    const scrollLeft = activeLink.offsetLeft - (navContainer.clientWidth / 2) + (activeLink.clientWidth / 2);
                    
                    navContainer.scrollTo({
                        left: scrollLeft,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}