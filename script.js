// ==========================================
// LOGIC SECTION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if(typeof menuData !== 'undefined'){
        Papa.parse(menuData, {
            header: true,
            skipEmptyLines: true,
            //download: true, // <--- Uncomment if using real 'menu.csv' file
            complete: function(results) {
                renderMenu(results.data);
            },
            error: function(err) {
                console.error("Error:", err);
            }
        });
    }
    

    // Navbar hiding logic
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('nav a');
    let lastScrollTop = 0;

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.add('navbar-hidden');
        });
    });

    window.addEventListener('scroll', () => {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        if (scrollTop < lastScrollTop) {
            // Scrolling up
            navbar.classList.remove('navbar-hidden');
        }
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // For Mobile or negative scrolling
    });
});

function renderMenu(items) {
    const container = document.getElementById('menu-container');
    container.innerHTML = '';

    // Group items by Category
    const grouped = items.reduce((acc, item) => {
        const cat = item.Category || 'Others';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    // Build HTML
    for (const [category, categoryItems] of Object.entries(grouped)) {
        
        // Category Title
        const catHeader = document.createElement('h3');
        catHeader.className = "text-2xl font-bold mb-6 text-brand-black border-l-4 border-brand-yellow pl-3";
        catHeader.textContent = category;
        
        // Grid Container
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12";

        categoryItems.forEach(item => {
            const card = document.createElement('div');
            // Card Styling
            card.className = "bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 flex flex-col h-full border border-gray-100";
            
            // Image Logic (Use placeholder if empty)
            const imgSrc = item.Image && item.Image.trim() !== '' 
                ? item.Image 
                : 'https://placehold.co/600x400/eee/ccc?text=No+Image';

            card.innerHTML = `
                <div class="h-48 overflow-hidden relative group">
                    <img src="${imgSrc}" alt="${item.Item}" class="w-full h-full object-cover transform group-hover:scale-110 transition duration-500">
                    <div class="absolute top-0 right-0 bg-brand-yellow text-brand-black font-bold px-3 py-1 m-2 rounded shadow">
                        ${item.Price}
                    </div>
                </div>
                <div class="p-5 flex flex-col flex-grow">
                    <h4 class="font-bold text-xl text-brand-black mb-2">${item.Item}</h4>
                    <p class="text-gray-600 text-sm mb-4 flex-grow">${item.Description}</p>
                </div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(catHeader);
        container.appendChild(grid);
    }
}