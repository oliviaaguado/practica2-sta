// Importamos Express
const express = require('express');

// Importo fs para leer archivos json
const fs = require('fs');

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

// Endpoint Buscar una película
app.get('/peliculas/:id', (req, res) => {
  const id = req.params.id;

  fs.readFile('peliculas.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({error: 'Error leyendo el archivo'});
      return;
    }

    const peliculas = JSON.parse(data);
    const pelicula = peliculas.find(p => p.id === id);

    if (!pelicula) {
      res.status(404).json({ error: 'Película no encontrada' });
      return;
    }

    res.json(pelicula);
  });
});

// Endpoint Crear una pelicula
// Endpoint borrar una pelicula
// Endpoint cambiar nombre
// Endpoint cambiar año
// Endpoint añadir actor
// Endpoint quitar actor
// Endpoint crear un actor
// Endpoint borrar un actor
// Endpoint modificar nombre de actor
// Endpoint modificar año de actor

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
