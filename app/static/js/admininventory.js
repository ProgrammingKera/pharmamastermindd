
function fetchInventory() {
    fetch('/api/products')
        .then(response => response.json())
        .then(data => {
            displayInventory(data);
        })
        .catch(error => {
            console.error('Error fetching inventory:', error);
        });
}


function displayInventory(inventory) {
    const inventoryGrid = document.getElementById('inventoryGrid');
    inventoryGrid.innerHTML = ''; 

    inventory.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${item.image_path || '/pictures/default.jpg'}" alt="${item.product_name}" class="product-image">
            <div class="product-info">
                <div class="product-details">
                    <h3>${item.product_name}</h3>
                    <p class="product-price">${item.price} PKR</p>
                    <p class="product-category">${item.category}</p>
                </div>
                <i class="fas fa-chevron-right chevron-right"></i>
            </div>
        `;
        
        card.addEventListener('click', () => showProductDetails(item));
        inventoryGrid.appendChild(card);
    });
}


function showProductDetails(product) {
    const modal = document.getElementById('productModal');
    const modalBody = modal.querySelector('.modal-body');

    modalBody.innerHTML = `
        <div class="product-detail-header">
            <img src="${product.image_path || '/pictures/default.jpg'}" alt="${product.product_name}" class="product-detail-image">
            <div class="product-detail-info">
                <h2>${product.product_name}</h2>
                <div class="product-detail-meta">
                    <div class="meta-item"><span class="meta-label">Price:</span><span class="meta-value">${product.price} PKR</span></div>
                    <div class="meta-item"><span class="meta-label">Category:</span><span class="meta-value">${product.category}</span></div>
                    <div class="meta-item"><span class="meta-label">Stock:</span><span class="meta-value">${product.stock_quantity} units</span></div>
                    <div class="meta-item"><span class="meta-label">Brand:</span><span class="meta-value">${product.brand}</span></div>
                    <div class="meta-item"><span class="meta-label">Expiry Date:</span><span class="meta-value">${product.expiry_date}</span></div>
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';

    
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.onclick = () => modal.style.display = 'none';

   
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}


document.addEventListener('DOMContentLoaded', () => {
    fetchInventory();
    setupNewEventListeners();
});

function setupNewEventListeners() {
    document.getElementById('addExpiryProductsBtn').addEventListener('click', addExpiryProductsToOrder);
    document.getElementById('addRestockProductsBtn').addEventListener('click', addRestockProductsToOrder);
}

async function addExpiryProductsToOrder() {
    try {
        const response = await fetch('/expiry_alerts');
        const expiryData = await response.json();
        
        if (expiryData.error) {
            throw new Error(expiryData.error);
        }
        
       
        const urgentExpiry = expiryData.filter(product => product.time_to_expiry <= 30);
        
        if (urgentExpiry.length === 0) {
            showNotification('No products expiring soon found!', 'info');
            return;
        }
        
       
        const orderProducts = urgentExpiry.map(product => ({
            name: product.product_name,
            price: 100, 
            quantity: 10 
        }));
        
        
        sessionStorage.setItem('expiryProducts', JSON.stringify(orderProducts));
        
        showNotification(`${urgentExpiry.length} expiry products added to order cart!`, 'success');
        
        
        setTimeout(() => {
            window.location.href = '/order';
        }, 1500);
        
    } catch (error) {
        console.error('Error fetching expiry products:', error);
        showNotification('Error loading expiry products', 'error');
    }
}

async function addRestockProductsToOrder() {
    try {
        const response = await fetch('/api/predict_restocks');
        const restockData = await response.json();
        
        if (restockData.error) {
            throw new Error(restockData.error);
        }
        
        
        const urgentRestock = restockData.filter(product => product.predicted_days_until_restock <= 14);
        
        if (urgentRestock.length === 0) {
            showNotification('No urgent restock products found!', 'info');
            return;
        }
        
       
        const orderProducts = urgentRestock.map(product => ({
            name: product.product_name,
            price: 150, 
            quantity: product.recommended_quantity
        }));
        
        
        sessionStorage.setItem('restockProducts', JSON.stringify(orderProducts));
        
        showNotification(`${urgentRestock.length} restock products added to order cart!`, 'success');
        
        
        setTimeout(() => {
            window.location.href = '/order';
        }, 1500);
        
    } catch (error) {
        console.error('Error fetching restock products:', error);
        showNotification('Error loading restock products', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'error' ? '#E74C3C' : type === 'success' ? '#27AE60' : type === 'warning' ? '#F39C12' : '#3498DB'};
        color: white;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            ${message}
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

  document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
    });
  });

const sidebar = document.querySelector('.sidebar');
const main = document.querySelector('.main-content');

document.querySelector('.toggle-btn').addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});