const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Importar modelos y rutas
const Producto = require('./models/Producto');
const productoRoutes = require('./routes/productos.route');
const usuarioRoutes = require('./routes/usuarios.route');
const categoriaRoutes = require('./routes/categorias.route');
const carritoRoutes = require('./routes/carrito.route');
const ordenRoutes = require('./routes/ordenes.route');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Conectado a MongoDB Atlas'))
    .catch(err => console.error('❌ Error:', err));

// Rutas API
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/ordenes', ordenRoutes);

// API de terceros - Imágenes aleatorias
app.get('/api/external/images', async (req, res) => {
    try {
        const response = await fetch('https://picsum.photos/v2/list?limit=20');
        const data = await response.json();
        res.json({
            mensaje: 'Imágenes obtenidas de API externa',
            fuente: 'https://picsum.photos',
            imagenes: data
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// API de terceros - Cotización de dólar
app.get('/api/exchange/usd', async (req, res) => {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        res.json({
            mensaje: 'Tipo de cambio obtenido',
            base: 'USD',
            rates: {
                CRC: data.rates.CRC,
                EUR: data.rates.EUR
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Producto para hero banner
app.get('/api/productos/hero', async (req, res) => {
    try {
        const heroProductId = "69e2bfdc9690651965f96eca";
        const producto = await Producto.findOne({ _id: heroProductId });
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(PORT, () => console.log(`🚀 Servidor en http://localhost:${PORT}`));