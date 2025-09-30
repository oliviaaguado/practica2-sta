// Importamos Express: framework para crear el servidor y definir rutas
const express = require('express');

// Creamos la aplicación
const app = express();

// Fs: métodos asíncronos basados en promesas para leer borrar o modificar archivos
const fs = require("fs/promises");      
// Path: para crear rutas de archivos válidas
const path = require("path");           
// Cors: middleware que perimte que el servidor acepte peticiones desde otros dominios
const cors = require("cors");           

// Activamos middlewares
app.use(cors());            // Permite que cualquier web haga peticiones a nuestra API (sin errores CORS)
app.use(express.json());    // Para poder recibir datos en formato JSON

// Definimos las rutas de los archivos de datos
const ACTORES_PATH = path.join(__dirname, "data", "actores.json");
const PELIS_PATH   = path.join(__dirname, "data", "peliculas.json");


// Funciones auxiliares para leer/escribir los ficheros JSON
async function leerJSON(ruta) {
  const raw = await fs.readFile(ruta, "utf8");  // Leer archivo como texto
  return JSON.parse(raw);                       // Convertir a objeto JS
}

async function escribirJSON(ruta, obj) {
  await fs.writeFile(ruta, JSON.stringify(obj, null, 2), "utf8"); // Guardar con sangría bonita
}

// Función que genera un id
function nuevoId(prefijo) {
  // Crea un id aleatorio tipo "a_xxxxx" o "p_xxxxx"
  return `${prefijo}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ===================== PELÍCULAS ===================== */

// GET /peliculas → lista todas las películas (con filtros opcionales)
app.get("/peliculas", async (req, res) => {
  const db = await leerJSON(PELIS_PATH);
  let lista = db.peliculas;

  const { nombre, anioPublicacion } = req.query; // Filtros opcionales en la URL ?nombre=...&anioPublicacion=...

  if (nombre) {
    lista = lista.filter(p => p.nombre.toLowerCase().includes(String(nombre).toLowerCase()));
  }
  if (anioPublicacion) {
    lista = lista.filter(p => String(p.anioPublicacion) === String(anioPublicacion));
  }
  res.json(lista);  // Devuelve array filtrado o completo
});


// Puerto donde escuchará nuestro servidor
const PORT = 3000;

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
