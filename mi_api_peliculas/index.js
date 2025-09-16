// Importamos Express
const express = require('express');

// Creamos la aplicación
const app = express();

// Puerto donde escuchará nuestro servidor
const PORT = 3000;

// Middleware para poder recibir datos en formato JSON
app.use(express.json());

// Endpoint de prueba
app.get('/', (req, res) => {
  res.send('API de Películas funcionando');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
