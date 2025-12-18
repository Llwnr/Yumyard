document.addEventListener('DOMContentLoaded', () => {
    if(typeof menuData !== 'undefined'){
        Papa.parse(menuData, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => initApp(results.data)
        });
    }

    // Scroll to Menu logic
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
        const menu = document.getElementById('menu-container');
        window.scrollTo({ top: menu.offsetTop - 150, behavior: 'smooth' });
    });
});

function initApp(items) {
    const cleanItems = items.filter(i => i.Item && i.Item.trim() !== "");
    const grouped = cleanItems.reduce((acc, item) => {
        const cat = item.Category ? item.Category.trim() : 'Others';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    renderSidebar(Object.keys(grouped));
    renderMenuGrid(grouped);
    initScrollSpy();
}

function renderSidebar(categories) {
    const nav = document.getElementById('category-nav');
    nav.innerHTML = '';
    categories.forEach(cat => {
        const catId = cat.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        const li = document.createElement('li');
        li.className = "flex-shrink-0";
        
        const btn = document.createElement('button');
        btn.className = "category-link px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-500 transition-all whitespace-nowrap shadow-sm hover:border-brand-yellow";
        btn.textContent = cat;
        btn.dataset.target = catId;
        
        btn.onclick = () => {
            const target = document.getElementById(catId);
            const offset = 160; // Height of Navbar + Category Bar
            window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
        };
        
        li.appendChild(btn);
        nav.appendChild(li);
    });
}

function renderMenuGrid(groupedItems) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    for (const [category, items] of Object.entries(groupedItems)) {
        const catId = category.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        
        const section = document.createElement('section');
        section.id = catId;
        // The scroll-mt here is the magic that stops the title being covered
        section.className = "scroll-mt-44 w-full overflow-hidden"; 
section.innerHTML = `
            <div class="flex items-center gap-4 mb-8">
                <h2 class="text-3xl font-black text-brand-black uppercase tracking-tight whitespace-nowrap">${category}</h2>
                <div class="h-px bg-gray-200 flex-grow"></div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                ${items.map(item => `
                    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col w-full group overflow-hidden">
                        <!-- Image Container: Set to full width and fixed height -->
                        ${item.Image ? `
                            <div class="w-full h-48 sm:h-56 flex-shrink-0 overflow-hidden bg-gray-50">
                                <img src="${item.Image}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                            </div>
                        ` : ''}
                        
                        <!-- Text Content: Added padding here since it's removed from parent -->
                        <div class="p-5 flex flex-col flex-grow">
                            <div class="flex justify-between items-start gap-2 mb-2">
                                <h4 class="font-bold text-xl text-brand-black leading-tight">${item.Item}</h4>
                                <span class="font-black text-brand-yellow whitespace-nowrap">${item.Price}</span>
                            </div>
                            
                            <p class="text-gray-500 text-sm line-clamp-3 break-words leading-relaxed mb-4">
                                ${item.Description || ''}
                            </p>

                            <div class="mt-auto">
                                <button class="text-xs font-bold text-brand-black uppercase border-b-2 border-brand-yellow w-max hover:bg-brand-yellow hover:px-2 transition-all">
                                    Add to Order
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(section);
    }
}

function initScrollSpy() {
    const navLinks = document.querySelectorAll('.category-link');
    const sections = document.querySelectorAll('section');
    const navContainer = document.getElementById('category-nav');

    window.addEventListener('scroll', () => {
        let current = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Buffer to trigger activation slightly before reaching the section
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active-category');
            if (link.dataset.target === current) {
                link.classList.add('active-category');
                
                // Keep the active pill centered in the horizontal scroll bar
                const scrollLeft = link.offsetLeft - (navContainer.clientWidth / 2) + (link.clientWidth / 2);
                navContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        });
    });
}