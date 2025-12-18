// ==========================================
// LOGIC SECTION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if(typeof menuData !== 'undefined'){
        Papa.parse(menuData, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                renderMenu(results.data);
                initScrollSpy();
            },
            error: function(err) {
                console.error("Error:", err);
            }
        });
    }
});

function renderMenu(items) {
    const container = document.getElementById('menu-container');
    const sidebarNav = document.getElementById('sidebar-nav');
    const mobileNav = document.getElementById('mobile-cat-nav');
    
    container.innerHTML = '';
    sidebarNav.innerHTML = '';
    mobileNav.innerHTML = '';

    // 1. Group items by Category
    const grouped = items.reduce((acc, item) => {
        const cat = item.Category ? item.Category.trim() : 'Others';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    const categories = Object.keys(grouped);

    // 2. Build Navigation (Sidebar & Mobile Bar)
    categories.forEach((cat, index) => {
        const catId = 'cat-' + index;
        
        // Desktop Sidebar Link
        const link = document.createElement('a');
        link.href = '#' + catId;
        link.className = 'nav-link block px-4 py-3 rounded-lg text-gray-600 hover:bg-brand-gray hover:text-brand-black transition text-sm font-semibold';
        link.textContent = cat;
        link.dataset.target = catId; // for scroll spy
        sidebarNav.appendChild(link);

        // Mobile Topbar Link
        const mobLink = document.createElement('a');
        mobLink.href = '#' + catId;
        mobLink.className = 'nav-link inline-block px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-brand-yellow hover:border-brand-yellow hover:text-brand-black transition';
        mobLink.textContent = cat;
        mobLink.dataset.target = catId;
        mobileNav.appendChild(mobLink);
    });

    // 3. Build Menu Grid
    categories.forEach((category, index) => {
        const catId = 'cat-' + index;
        
        // Section Wrapper
        const section = document.createElement('section');
        section.id = catId;
        section.className = "scroll-mt-32 lg:scroll-mt-8 mb-16 category-section"; // scroll-mt handles spacing when clicking links

        // Category Title
        const catHeader = document.createElement('div');
        catHeader.className = "flex items-center gap-4 mb-8";
        catHeader.innerHTML = `
            <h3 class="text-3xl font-black text-brand-black uppercase tracking-tight">${category}</h3>
            <div class="h-1 flex-grow bg-gray-200 rounded-full"></div>
        `;
        
        // Grid Container
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6";

        grouped[category].forEach(item => {
            const card = document.createElement('div');
            // Clean White Card with Hover Effect
            card.className = "bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-yellow transition duration-300 flex flex-row md:flex-col gap-4 group";
            
            // Image Logic
            const imgSrc = item.Image && item.Image.trim() !== '' 
                ? item.Image 
                : 'https://placehold.co/600x400/f3f4f6/cbd5e1?text=YumYard';

            card.innerHTML = `
                <!-- Image Wrapper -->
                <div class="w-24 h-24 md:w-full md:h-48 shrink-0 overflow-hidden rounded-lg bg-gray-100 relative">
                    <img src="${imgSrc}" alt="${item.Item}" class="w-full h-full object-cover transform group-hover:scale-105 transition duration-500">
                </div>
                
                <!-- Content -->
                <div class="flex flex-col flex-grow justify-between">
                    <div>
                        <div class="flex justify-between items-start">
                            <h4 class="font-bold text-lg text-brand-black leading-tight mb-1">${item.Item}</h4>
                            <span class="font-bold text-brand-yellowDark whitespace-nowrap ml-2">${item.Price}</span>
                        </div>
                        <p class="text-gray-500 text-xs md:text-sm line-clamp-2 md:line-clamp-3 leading-relaxed mt-1">${item.Description}</p>
                    </div>
                    <!-- Add Button (Visual only) -->
                    <div class="mt-3 md:mt-4 pt-3 border-t border-gray-50 flex justify-end">
                        <button class="text-xs font-bold uppercase tracking-wider text-brand-black bg-brand-yellow px-3 py-1 rounded hover:bg-black hover:text-white transition">
                            Add +
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });

        section.appendChild(catHeader);
        section.appendChild(grid);
        container.appendChild(section);
    });
}

// ==========================================
// SCROLL SPY LOGIC
// ==========================================
function initScrollSpy() {
    const sections = document.querySelectorAll('.category-section');
    const navLinks = document.querySelectorAll('.nav-link');

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section is near top
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all
                navLinks.forEach(link => {
                    link.classList.remove('active-category', 'bg-brand-yellow', 'text-brand-black');
                    // Reset to default styles
                    if(link.parentElement.id === 'sidebar-nav') {
                         link.classList.add('text-gray-600');
                    }
                });

                // Add active class to current
                const activeId = entry.target.id;
                const activeLinks = document.querySelectorAll(`.nav-link[data-target="${activeId}"]`);
                
                activeLinks.forEach(activeLink => {
                    activeLink.classList.remove('text-gray-600');
                    activeLink.classList.add('active-category');
                    
                    // Specific logic for mobile scroll centering
                    if(activeLink.parentElement.id === 'mobile-cat-nav') {
                        activeLink.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}