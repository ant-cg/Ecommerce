const API_URL = 'http://localhost:5000/api';
let usuarioActual = null;

function obtenerUsuarioActual() {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        usuarioActual = JSON.parse(usuario);
        return usuarioActual;
    }
    return null;
}

function obtenerToken() {
    return localStorage.getItem('token');
}

function cerrarSesion() {
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
}

function actualizarNavbarUsuario() {
    const usuario = obtenerUsuarioActual();
    const userIcon = document.getElementById('btnUsuario');
    const usuarioNombreSpan = document.getElementById('usuarioNombre');
    
    if (usuario && userIcon) {
        if (usuarioNombreSpan) {
            usuarioNombreSpan.textContent = usuario.nombre.split(' ')[0];
        }
        userIcon.href = "#";
        userIcon.removeEventListener('click', cerrarSesion);
        userIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cerrarSesion();
        });
    } else if (userIcon) {
        if (usuarioNombreSpan) {
            usuarioNombreSpan.textContent = '';
        }
        userIcon.href = "login.html";
        userIcon.removeEventListener('click', cerrarSesion);
    }
}

async function obtenerCarrito() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return [];

    try {
        const response = await fetch(`${API_URL}/carrito/${usuario.id}`, {
            headers: { 'Authorization': `Bearer ${obtenerToken()}` }
        });
        
        if (response.ok) {
            const carrito = await response.json();
            return carrito.productos || [];
        }
        return [];
    } catch (error) {
        console.error('Error:', error);
        return [];
    }
}

async function actualizarCantidad(productoId, cantidad) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return false;

    try {
        const response = await fetch(`${API_URL}/carrito/actualizar`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify({
                usuarioId: usuario.id,
                productoId: productoId,
                cantidad: cantidad
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

async function eliminarProductoCarrito(productoId) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return false;

    try {
        const response = await fetch(`${API_URL}/carrito/${usuario.id}/${productoId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${obtenerToken()}` }
        });
        return response.ok;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

async function crearOrden(direccion, telefono) {
    const usuario = obtenerUsuarioActual();
    if (!usuario) return false;

    try {
        const response = await fetch(`${API_URL}/ordenes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify({
                usuarioId: usuario.id,
                direccion: direccion,
                telefono: telefono
            })
        });

        if (response.ok) {
            const orden = await response.json();
            return orden;
        } else {
            const error = await response.json();
            Swal.fire({ icon: "error", title: "Error", text: error.message });
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

async function cargarCarrito() {
    const listaContainer = document.getElementById('carritoLista');
    const resumenContainer = document.getElementById('resumenContent');
    
    if (!listaContainer) return;
    
    const productos = await obtenerCarrito();
    
    if (productos.length === 0) {
        listaContainer.innerHTML = '<div class="carrito-vacio"><i data-feather="shopping-cart"></i><p>Tu carrito está vacío</p><a href="home.html" style="color:#bfa8ff;">Ir a la tienda</a></div>';
        resumenContainer.innerHTML = '';
        return;
    }
    
    listaContainer.innerHTML = '';
    let subtotal = 0;
    
    for (let i = 0; i < productos.length; i++) {
        const item = productos[i];
        const itemTotal = item.cantidad * item.precio;
        subtotal += itemTotal;
        
        const itemDiv = document.createElement('div');
        itemDiv.className = 'carrito-item';
        itemDiv.innerHTML = `
            <img src="${item.imagen}" alt="${item.nombre}" class="carrito-item-imagen" onerror="this.src='https://placehold.co/100x100/e9eaec/333?text=${encodeURIComponent(item.nombre)}'">
            <div class="carrito-item-info">
                <div class="carrito-item-nombre">${item.nombre}</div>
                <div class="carrito-item-precio">$${item.precio}</div>
                <div class="carrito-item-cantidad">
                    <button class="btn-decrementar" data-id="${item.productoId}">-</button>
                    <span id="cantidad-${item.productoId}">${item.cantidad}</span>
                    <button class="btn-incrementar" data-id="${item.productoId}">+</button>
                    <span class="carrito-item-eliminar" data-id="${item.productoId}">✖️ Eliminar</span>
                </div>
            </div>
        `;
        listaContainer.appendChild(itemDiv);
    }
    
    const iva = subtotal * 0.13;
    const servicio = 10;
    const envio = 0;
    const total = subtotal + iva + servicio + envio;
    
    resumenContainer.innerHTML = `
        <div class="resumen-linea"><span>Subtotal:</span><span>$${subtotal.toFixed(2)}</span></div>
        <div class="resumen-linea"><span>IVA (13%):</span><span>$${iva.toFixed(2)}</span></div>
        <div class="resumen-linea"><span>Servicio:</span><span>$${servicio.toFixed(2)}</span></div>
        <div class="resumen-linea"><span>Envío:</span><span>$${envio.toFixed(2)}</span></div>
        <div class="resumen-total"><span>TOTAL:</span><span>$${total.toFixed(2)}</span></div>
        <button class="btn-checkout" id="btnCheckout">Proceder al pago</button>
    `;
    
    feather.replace();
    
    document.querySelectorAll('.btn-incrementar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const productoId = btn.dataset.id;
            const cantidadSpan = document.getElementById(`cantidad-${productoId}`);
            let nuevaCantidad = parseInt(cantidadSpan.textContent) + 1;
            await actualizarCantidad(productoId, nuevaCantidad);
            cargarCarrito();
        });
    });
    
    document.querySelectorAll('.btn-decrementar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const productoId = btn.dataset.id;
            const cantidadSpan = document.getElementById(`cantidad-${productoId}`);
            let nuevaCantidad = parseInt(cantidadSpan.textContent) - 1;
            if (nuevaCantidad > 0) {
                await actualizarCantidad(productoId, nuevaCantidad);
                cargarCarrito();
            } else {
                await eliminarProductoCarrito(productoId);
                cargarCarrito();
            }
        });
    });
    
    document.querySelectorAll('.carrito-item-eliminar').forEach(btn => {
        btn.addEventListener('click', async () => {
            const productoId = btn.dataset.id;
            Swal.fire({
                title: "¿Eliminar producto?",
                text: "¿Estás seguro de eliminar este producto del carrito?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"
            }).then(async (result) => {
                if (result.isConfirmed) {
                    await eliminarProductoCarrito(productoId);
                    cargarCarrito();
                    Swal.fire("Eliminado", "Producto eliminado del carrito", "success");
                }
            });
        });
    });
    
    const btnCheckout = document.getElementById('btnCheckout');
    if (btnCheckout) {
        btnCheckout.addEventListener('click', () => {
            mostrarModalPago();
        });
    }
}

function mostrarModalPago() {
    const modalHtml = `
        <div id="modalPago" class="modal-overlay" style="display: flex;">
            <div class="modal-content">
                <button class="modal-close" id="closeModalPago">✖</button>
                <h3>Datos de envío</h3>
                <div class="form-group">
                    <label>Dirección de envío *</label>
                    <input type="text" id="direccionEnvio" placeholder="Calle, número, ciudad" required>
                </div>
                <div class="form-group">
                    <label>Teléfono de contacto *</label>
                    <input type="tel" id="telefonoContacto" placeholder="Número de teléfono" required>
                </div>
                <button class="btn-guardar" id="confirmarPago">
                    <i data-feather="credit-card"></i> Confirmar compra
                </button>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    feather.replace();
    
    document.getElementById('closeModalPago').addEventListener('click', () => {
        document.getElementById('modalPago').remove();
    });
    
    document.getElementById('confirmarPago').addEventListener('click', async () => {
        const direccion = document.getElementById('direccionEnvio').value.trim();
        const telefono = document.getElementById('telefonoContacto').value.trim();
        
        if (!direccion || !telefono) {
            Swal.fire({ icon: "warning", title: "Campos incompletos", text: "Por favor completa todos los campos" });
            return;
        }
        
        Swal.fire({
            title: "Confirmar compra",
            text: "¿Estás seguro de realizar esta compra?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, comprar",
            cancelButtonText: "Cancelar"
        }).then(async (result) => {
            if (result.isConfirmed) {
                const orden = await crearOrden(direccion, telefono);
                if (orden) {
                    Swal.fire({
                        icon: "success",
                        title: "¡Compra realizada!",
                        html: `Total: <strong>$${orden.total.toFixed(2)}</strong><br>Orden #${orden._id.slice(-6)}`
                    }).then(() => {
                        document.getElementById('modalPago').remove();
                        cargarCarrito();
                    });
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    actualizarNavbarUsuario();
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        const carritoContainer = document.querySelector('.carrito-container');
        if (carritoContainer) {
            carritoContainer.innerHTML = `
                <div class="carrito-vacio" style="grid-column: 1/-1; text-align: center; padding: 60px;">
                    <i data-feather="lock"></i>
                    <p>Debes iniciar sesión para ver tu carrito</p>
                    <a href="login.html" style="color:#bfa8ff;">Iniciar sesión</a>
                </div>
            `;
        }
    } else {
        cargarCarrito();
    }
});