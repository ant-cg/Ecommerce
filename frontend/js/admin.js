const API_URL = 'http://localhost:5000/api/productos';
let productoEditandoId = null;

// Verificar autenticación y rol
function verificarAdmin() {
    const token = localStorage.getItem('token');
    const usuario = localStorage.getItem('usuario');
    
    if (!token || !usuario) {
        alert('Debes iniciar sesión como administrador');
        window.location.href = 'login.html';
        return false;
    }
    
    const usuarioData = JSON.parse(usuario);
    if (usuarioData.tipoUsuario !== 'admin') {
        alert('Acceso denegado. Se requieren privilegios de administrador.');
        window.location.href = 'home.html';
        return false;
    }
    
    return true;
}

function obtenerToken() {
    return localStorage.getItem('token');
}

async function cargarProductos() {
    if (!verificarAdmin()) return;
    
    const listaContainer = document.getElementById('productosLista');
    listaContainer.innerHTML = '<div class="cargando"><i data-feather="loader"></i><p>Cargando productos...</p></div>';
    
    try {
        const response = await fetch(API_URL, {
            headers: {
                'Authorization': `Bearer ${obtenerToken()}`
            }
        });
        const productos = await response.json();
        
        if (productos.length === 0) {
            listaContainer.innerHTML = '<div class="error"><p>No hay productos disponibles. Agrega uno nuevo.</p></div>';
            return;
        }
        
        listaContainer.innerHTML = '';
        
        productos.forEach(producto => {
            const item = document.createElement('div');
            item.className = 'admin-item';
            item.innerHTML = `
                <div class="admin-item-info">
                    <div class="admin-item-nombre">${producto.nombre}</div>
                    <div class="admin-item-precio">$${producto.precio}</div>
                </div>
                <div class="admin-item-acciones">
                    <button class="btn-modificar" data-id="${producto._id}" data-nombre="${producto.nombre}" data-precio="${producto.precio}" data-imagen="${producto.imagen}" data-descripcion="${producto.descripcion || ''}">
                        <i data-feather="edit-2"></i> Modificar
                    </button>
                    <button class="btn-eliminar" data-id="${producto._id}">
                        <i data-feather="trash-2"></i> Eliminar
                    </button>
                </div>
            `;
            listaContainer.appendChild(item);
        });
        
        feather.replace();
        
        document.querySelectorAll('.btn-modificar').forEach(btn => {
            btn.addEventListener('click', () => {
                productoEditandoId = btn.dataset.id;
                document.getElementById('editNombre').value = btn.dataset.nombre;
                document.getElementById('editPrecio').value = btn.dataset.precio;
                document.getElementById('editImagen').value = btn.dataset.imagen;
                document.getElementById('editDescripcion').value = btn.dataset.descripcion;
                document.getElementById('modalEditar').classList.add('active');
            });
        });
        
        document.querySelectorAll('.btn-eliminar').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('¿Estás seguro de eliminar este producto?')) {
                    try {
                        const response = await fetch(`${API_URL}/${btn.dataset.id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${obtenerToken()}`
                            }
                        });
                        if (response.ok) {
                            alert('Producto eliminado correctamente');
                            cargarProductos();
                        } else {
                            alert('Error al eliminar el producto');
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        alert('Error al eliminar el producto');
                    }
                }
            });
        });
        
    } catch (error) {
        console.error('Error:', error);
        listaContainer.innerHTML = '<div class="error"><p>Error cargando productos. Asegúrate que el servidor esté corriendo.</p></div>';
    }
}

async function agregarProducto(event) {
    event.preventDefault();
    
    const nuevoProducto = {
        nombre: document.getElementById('nombre').value,
        precio: parseFloat(document.getElementById('precio').value),
        imagen: document.getElementById('imagen').value,
        descripcion: document.getElementById('descripcion').value,
        stock: 10
    };
    
    if (!nuevoProducto.nombre || !nuevoProducto.precio || !nuevoProducto.imagen) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify(nuevoProducto)
        });
        
        if (response.ok) {
            alert('Producto agregado correctamente');
            document.getElementById('formAgregar').reset();
            cargarProductos();
        } else {
            const error = await response.json();
            alert('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar el producto');
    }
}

async function guardarEdicion() {
    const productoActualizado = {
        nombre: document.getElementById('editNombre').value,
        precio: parseFloat(document.getElementById('editPrecio').value),
        imagen: document.getElementById('editImagen').value,
        descripcion: document.getElementById('editDescripcion').value
    };
    
    if (!productoActualizado.nombre || !productoActualizado.precio || !productoActualizado.imagen) {
        alert('Por favor completa todos los campos obligatorios');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${productoEditandoId}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${obtenerToken()}`
            },
            body: JSON.stringify(productoActualizado)
        });
        
        if (response.ok) {
            alert('Producto modificado correctamente');
            cerrarModal();
            cargarProductos();
        } else {
            const error = await response.json();
            alert('Error: ' + error.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al modificar el producto');
    }
}

function cerrarModal() {
    document.getElementById('modalEditar').classList.remove('active');
    productoEditandoId = null;
}

document.addEventListener('DOMContentLoaded', () => {
    if (verificarAdmin()) {
        cargarProductos();
        document.getElementById('formAgregar').addEventListener('submit', agregarProducto);
        document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
        document.getElementById('btnGuardarEdit').addEventListener('click', guardarEdicion);
        
        document.getElementById('modalEditar').addEventListener('click', (e) => {
            if (e.target === document.getElementById('modalEditar')) {
                cerrarModal();
            }
        });
    }
});