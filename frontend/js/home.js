const API_URL = 'http://localhost:5000/api/productos';
const CARRITO_API = 'http://localhost:5000/api/carrito';

let todosLosProductos = [];
let productosFiltrados = [];
let currentPage = 1;
let itemsPerPage = 8;
let currentCategory = 'all';

function obtenerToken() {
    return localStorage.getItem('token');
}

function obtenerUsuario() {
    const usuario = localStorage.getItem('usuario');
    return usuario ? JSON.parse(usuario) : null;
}

// Actualizar navbar con nombre de usuario
function actualizarNavbarUsuario() {
    const usuario = obtenerUsuario();
    const btnUsuario = document.getElementById('btnUsuario');
    const mobileUserIcon = document.querySelector('.mobile-icons .nav-icon-link:last-child');
    
    if (usuario && btnUsuario) {
        btnUsuario.innerHTML = `<i data-feather="user"></i> ${usuario.nombre.split(' ')[0]}`;
        btnUsuario.href = "#";
        btnUsuario.title = "Mi cuenta";
        
        if (mobileUserIcon) {
            mobileUserIcon.innerHTML = `<i data-feather="user"></i> ${usuario.nombre.split(' ')[0]}`;
            mobileUserIcon.href = "#";
        }
        
        // Evento cerrar sesión
        btnUsuario.addEventListener('click', (e) => {
            e.preventDefault();
            Swal.fire({
                title: "Cerrar sesión",
                text: "¿Estás seguro que deseas cerrar sesión?",
                icon: "question",
                showCancelButton: true,
                confirmButtonText: "Sí, salir",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('usuario');
                    window.location.href = 'login.html';
                }
            });
        });
    } else if (btnUsuario) {
        btnUsuario.innerHTML = '<i data-feather="user"></i>';
        btnUsuario.href = "login.html";
        if (mobileUserIcon) {
            mobileUserIcon.innerHTML = '<i data-feather="user"></i>';
            mobileUserIcon.href = "login.html";
        }
    }
}

// Agregar al carrito en BD
async function agregarAlCarrito(producto, btn) {
    const usuario = obtenerUsuario();
    
    if (!usuario) {
        Swal.fire({
            icon: "warning",
            title: "Inicia sesión",
            text: "Debes iniciar sesión para agregar productos al carrito",
            confirmButtonText: "Ir a login"
        }).then(() => {
            window.location.href = "login.html";
        });
        return;
    }
    
    try {
        const response = await fetch(`${CARRITO_API}/agregar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify({
                usuarioId: usuario.id,
                productoId: producto.id,
                cantidad: 1
            })
        });
        
        if (response.ok) {
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i data-feather="check"></i> Agregado';
                btn.style.background = '#bfa8ff';
                btn.style.color = '#000';
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.background = '#111';
                    btn.style.color = '#fff';
                }, 1500);
            }
            
            Swal.fire({
                icon: "success",
                title: "Agregado",
                text: `${producto.nombre} agregado al carrito`,
                timer: 1500,
                showConfirmButton: false
            });
        } else {
            const error = await response.json();
            Swal.fire({
                icon: "error",
                title: "Error",
                text: error.message || "Error al agregar al carrito"
            });
        }
    } catch (error) {
        console.error('Error:', error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error al conectar con el servidor"
        });
    }
}

async function cargarProductos() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    container.innerHTML = '<div class="cargando"><i data-feather="loader"></i><p>Cargando productos...</p></div>';
    
    try {
        const response = await fetch(API_URL);
        todosLosProductos = await response.json();
        
        if (todosLosProductos.length === 0) {
            container.innerHTML = '<div class="error"><p>No hay productos disponibles</p></div>';
            return;
        }
        
        aplicarFiltrosYRenderizar();
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="error"><p>Error cargando productos. Asegúrate que el servidor esté corriendo.</p></div>';
    }
}

async function cargarUltimoProducto() {
    const producto = {
        _id: "69e2bfdc9690651965f96eca",
        nombre: "Apple iPhone 14 Pro",
        precio: 1399,
        imagen: "https://storage.googleapis.com/alpine-inkwell-325917.appspot.com/devices/iphone-14-header.png",
        descripcion: "iPhone 14 Pro morado de titanio",
        stock: 10
    };
    
    const heroTitle = document.querySelector('.hero-title');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroDesc = document.querySelector('.hero-desc');
    const heroImage = document.getElementById('heroProductImg');
    const btnComprar = document.querySelector('.btn-comprar');
    
    if (heroTitle) heroTitle.textContent = producto.nombre;
    if (heroSubtitle) heroSubtitle.textContent = '✨ Producto Destacado ✨';
    if (heroDesc) heroDesc.textContent = producto.descripcion;
    
    if (heroImage) {
        heroImage.src = producto.imagen;
        heroImage.onerror = () => { 
            heroImage.src = 'https://placehold.co/400x300/e9eaec/333?text=' + encodeURIComponent(producto.nombre);
        };
    }
    
    const heroBanner = document.querySelector('.hero-banner');
    if (heroBanner) {
        heroBanner.style.cursor = 'pointer';
        heroBanner.onclick = () => abrirModal(producto);
    }
    
    if (btnComprar) {
        const newBtn = btnComprar.cloneNode(true);
        btnComprar.parentNode.replaceChild(newBtn, btnComprar);
        newBtn.onclick = (e) => {
            e.stopPropagation();
            agregarAlCarrito({
                id: producto._id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen
            }, newBtn);
        };
    }
}

function aplicarFiltrosYRenderizar() {
    if (currentCategory === 'all') {
        productosFiltrados = [...todosLosProductos];
    } else {
        productosFiltrados = todosLosProductos.filter(producto => 
            producto.categoria === currentCategory
        );
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim() !== '') {
        const query = searchInput.value.toLowerCase();
        productosFiltrados = productosFiltrados.filter(producto => 
            producto.nombre.toLowerCase().includes(query)
        );
    }
    
    const totalPages = Math.ceil(productosFiltrados.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) currentPage = 1;
    if (totalPages === 0) currentPage = 1;
    
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productosPagina = productosFiltrados.slice(start, end);
    
    renderizarProductos(productosPagina);
    renderizarPaginacion(totalPages);
}

function renderizarProductos(productos) {
    const container = document.getElementById('productsGrid');
    
    if (!container) return;
    
    if (productos.length === 0) {
        container.innerHTML = '<div class="error"><p>No hay productos que coincidan con tu búsqueda</p></div>';
        return;
    }
    
    container.innerHTML = '';
    
    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        if (producto.categoria) {
            card.setAttribute('data-category', producto.categoria);
        }
        card.setAttribute('data-id', producto._id);
        
        card.innerHTML = `
            <div class="product-img-container">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="product-img" onerror="this.src='https://placehold.co/400x300/e9eaec/333?text=${encodeURIComponent(producto.nombre)}'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-price">$${producto.precio}</p>
                <button class="btn-add-cart" data-id="${producto._id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}" data-imagen="${producto.imagen}">
                    <i data-feather="shopping-cart"></i> Comprar
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    feather.replace();
    
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const producto = {
                id: btn.dataset.id,
                nombre: btn.dataset.nombre,
                precio: parseFloat(btn.dataset.precio),
                imagen: btn.dataset.imagen
            };
            agregarAlCarrito(producto, btn);
        });
    });
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-add-cart')) {
                const id = card.dataset.id;
                const producto = todosLosProductos.find(p => p._id === id);
                if (producto) abrirModal(producto);
            }
        });
    });
}

function mostrarNotificacion(mensaje, color) {
    const notificacion = document.createElement('div');
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${color};
        color: white;
        padding: 12px 24px;
        border-radius: 40px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 2000);
}

function renderizarPaginacion(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }
    
    paginationContainer.style.display = 'flex';
    paginationContainer.innerHTML = '';
    
    const prevBtn = document.createElement('button');
    prevBtn.className = 'page-btn prev';
    prevBtn.innerHTML = '<i data-feather="chevron-left"></i>';
    if (currentPage === 1) prevBtn.disabled = true;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            aplicarFiltrosYRenderizar();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationContainer.appendChild(prevBtn);
    
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (startPage > 1) {
        const firstBtn = crearBotonPagina(1);
        paginationContainer.appendChild(firstBtn);
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '…';
            paginationContainer.appendChild(dots);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = crearBotonPagina(i);
        paginationContainer.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'page-dots';
            dots.textContent = '…';
            paginationContainer.appendChild(dots);
        }
        const lastBtn = crearBotonPagina(totalPages);
        paginationContainer.appendChild(lastBtn);
    }
    
    const nextBtn = document.createElement('button');
    nextBtn.className = 'page-btn next';
    nextBtn.innerHTML = '<i data-feather="chevron-right"></i>';
    if (currentPage === totalPages) nextBtn.disabled = true;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            aplicarFiltrosYRenderizar();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    paginationContainer.appendChild(nextBtn);
    
    feather.replace();
}

function crearBotonPagina(pageNum) {
    const btn = document.createElement('button');
    btn.className = 'page-btn';
    if (pageNum === currentPage) btn.classList.add('active');
    btn.textContent = pageNum;
    btn.setAttribute('data-page', pageNum);
    btn.addEventListener('click', () => {
        currentPage = pageNum;
        aplicarFiltrosYRenderizar();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return btn;
}

function abrirModal(producto) {
    const modal = document.getElementById('modalProducto');
    if (!modal) return;
    
    const modalImg = document.getElementById('modalImg');
    const modalName = document.getElementById('modalName');
    const modalPrice = document.getElementById('modalPrice');
    const modalDesc = document.getElementById('modalDesc');
    const modalAddCart = document.getElementById('modalAddCart');
    
    if (modalImg) {
        modalImg.src = producto.imagen;
        modalImg.onerror = () => { modalImg.src = 'https://placehold.co/400x300/e9eaec/333?text=' + encodeURIComponent(producto.nombre); };
    }
    if (modalName) modalName.textContent = producto.nombre;
    if (modalPrice) modalPrice.textContent = `$${producto.precio}`;
    if (modalDesc) modalDesc.textContent = producto.descripcion || 'Producto de alta calidad con tecnología de punta.';
    
    if (modalAddCart) {
        modalAddCart.onclick = () => {
            agregarAlCarrito({
                id: producto._id,
                nombre: producto.nombre,
                precio: producto.precio,
                imagen: producto.imagen
            }, modalAddCart);
        };
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    const modal = document.getElementById('modalProducto');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function filtrarPorCategoria(categoria) {
    currentCategory = categoria;
    currentPage = 1;
    aplicarFiltrosYRenderizar();
}

function inicializarEventos() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentPage = 1;
            aplicarFiltrosYRenderizar();
        });
    }
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const categoria = btn.getAttribute('data-tab');
            filtrarPorCategoria(categoria);
        });
    });
    
    const modalClose = document.getElementById('modalClose');
    if (modalClose) {
        modalClose.addEventListener('click', cerrarModal);
    }
    
    const modalOverlay = document.getElementById('modalProducto');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) cerrarModal();
        });
    }
    
    const btnHamburger = document.getElementById('btnHamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    if (btnHamburger && mobileMenu) {
        btnHamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('open');
            if (mobileMenu.classList.contains('open')) {
                btnHamburger.innerHTML = '<i data-feather="x"></i>';
            } else {
                btnHamburger.innerHTML = '<i data-feather="menu"></i>';
            }
            feather.replace();
        });
    }
    
    const btnCarrito = document.getElementById('btnCarrito');
    if (btnCarrito) {
        btnCarrito.addEventListener('click', () => {
            window.location.href = 'carrito.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarNavbarUsuario();
    inicializarEventos();
    cargarProductos();
    cargarUltimoProducto();
});

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);