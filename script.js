document.addEventListener('DOMContentLoaded', () => {
    const menuItemsContainer = document.getElementById('menu-items');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cartCount = document.getElementById('cart-count');
    const cartIcon = document.querySelector('.cart-icon');
    const modal = document.getElementById('cart-modal');
    const closeBtn = document.querySelector('.close-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');

    let menuData = {};
    let cart = JSON.parse(localStorage.getItem('blacksCart')) || [];

    // Carregar itens do menu do JSON ativar ao hospedar
    async function loadMenu() {
        try {
            const response = await fetch('menu.json');
            menuData = await response.json();
            displayMenuItems('all');
        } catch (error) {
            console.error('Erro ao carregar o cardápio:', error);
            menuItemsContainer.innerHTML = '<p>Não foi possível carregar o cardápio. Tente novamente mais tarde.</p>';
        }
    }
    // Exibir itens do menu com base na categoria
    function displayMenuItems(category) {
        menuItemsContainer.innerHTML = '';
        let itemsToDisplay = [];
        
        if (category === 'all') {
            itemsToDisplay = Object.values(menuData).flat();
            
        } else {
            itemsToDisplay = menuData[category] || [];
        }

        if (itemsToDisplay.length === 0) {
            menuItemsContainer.innerHTML = '<p>Nenhum item encontrado nesta categoria.</p>';
            return;
        }

        itemsToDisplay.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                <div class="menu-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <p class="menu-item-price">R$ ${item.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${item.id}">Adicionar ao Carrinho</button>
                </div>
            `;
            menuItemsContainer.appendChild(itemElement);
        });
    }

    // Lógica dos filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-category');
            displayMenuItems(category);
        });
    });

    // Lógica do Carrinho
    function addToCart(id) {
        const allItems = Object.values(menuData).flat();
        const itemToAdd = allItems.find(item => item.id === id);

        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ ...itemToAdd, quantity: 1 });
        }
        updateCart();
    }
    
    function updateCart() {
        renderCartItems();
        updateCartCount();
        updateCartTotal();
        localStorage.setItem('blacksCart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `R$ ${total.toFixed(2)}`;
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
            return;
        }

        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h5>${item.name}</h5>
                    <p>R$ ${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                    <button class="remove-item-btn" data-id="${item.id}">×</button>
                </div>
            </div>
        `).join('');
    }

    function handleCartControls(e) {
        if (!e.target.hasAttribute('data-id')) return;
        
        const id = parseInt(e.target.getAttribute('data-id'));
        const action = e.target.getAttribute('data-action');
        
        if (e.target.classList.contains('quantity-btn')) {
            const item = cart.find(i => i.id === id);
            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity === 0) {
                    cart = cart.filter(i => i.id !== id);
                }
            }
        }

        if (e.target.classList.contains('remove-item-btn')) {
            cart = cart.filter(i => i.id !== id);
        }
        
        updateCart();
    }

    // Event Listeners
    menuItemsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            const id = parseInt(e.target.getAttribute('data-id'));
            addToCart(id);
        }
    });
    
    cartIcon.addEventListener('click', () => {
        modal.style.display = 'block';
        updateCart();
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    cartItemsContainer.addEventListener('click', handleCartControls);

    // Inicialização
    
    displayMenuItems('all');
    loadMenu();
    updateCartCount();

});
