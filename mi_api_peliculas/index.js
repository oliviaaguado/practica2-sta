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

// req --> objeto que representa lo que el cliente envía al servidor
// res --> objeto que representa lo que el servidor va a enviar de vuelta al cliente

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

// GET /peliculas/:id → devuelve una película concreta
app.get("/peliculas/:id", async (req, res) => {
  const db = await leerJSON(PELIS_PATH);
  const peli = db.peliculas.find(p => p.id === req.params.id);
  if (!peli) return res.status(404).json({ error: "Película no encontrada" });
  res.json(peli);
});

// POST /peliculas → crea una nueva película
// Ejemplo de body: {
//  "nombre": "John Wick",
//  "anioPublicacion": 2014,
//  "actores": ["a_001","a_002"]   // opcional; si no se manda, se usa []
//}

app.post("/peliculas", async (req, res) => {
  const { nombre, anioPublicacion, actores } = req.body || {};
  if (!nombre || !Number.isInteger(anioPublicacion)) {
    // Validamos que venga título y año entero
    return res.status(400).json({ error: "nombre (string) y anioPublicacion (int) requeridos" });
  }
  const db = await leerJSON(PELIS_PATH);
  const nueva = { id: nuevoId("p"), nombre, anioPublicacion, actores: Array.isArray(actores) ? actores : [] };
  db.peliculas.push(nueva);
  await escribirJSON(PELIS_PATH, db);
  res.status(201).json(nueva);  // Respuesta con la película creada
});


// PATCH /peliculas/:id → modifica una película
// Ejemplo de body: { "nombre": "Nuevo Título", "anioPublicacion": 2020 }
app.patch("/peliculas/:id", async (req, res) => {
  const db = await leerJSON(PELIS_PATH);
  const peli = db.peliculas.find(p => p.id === req.params.id);
  if (!peli) return res.status(404).json({ error: "Película no encontrada" });

  const { nombre, anioPublicacion } = req.body || {};
  if (nombre !== undefined) peli.nombre = nombre;
  if (anioPublicacion !== undefined) {
    if (!Number.isInteger(anioPublicacion)) return res.status(400).json({ error: "anioPublicacion debe ser int" });
    peli.anioPublicacion = anioPublicacion;
  }
  await escribirJSON(PELIS_PATH, db);
  res.json(peli);  // Devolvemos película modificada
});


// POST /peliculas/:id/actores → añade un actor a la película
// No crea el actor, añade un actor ya 'registrado'
app.post("/peliculas/:id/actores", async (req, res) => {
  const { actorId } = req.body || {};
  if (!actorId) return res.status(400).json({ error: "actorId requerido" });

  const mdb = await leerJSON(PELIS_PATH);
  const peli = mdb.peliculas.find(p => p.id === req.params.id);
  if (!peli) return res.status(404).json({ error: "Película no encontrada" });

  const set = new Set(peli.actores || []); // Set para evitar duplicados
  set.add(actorId);
  peli.actores = [...set];

  await escribirJSON(PELIS_PATH, mdb);
  res.json(peli);
});

// DELETE /peliculas/:id/actores/:actorId → quita un actor de la película
app.delete("/peliculas/:id/actores/:actorId", async (req, res) => {
  const mdb = await leerJSON(PELIS_PATH);
  const peli = mdb.peliculas.find(p => p.id === req.params.id);
  if (!peli) return res.status(404).json({ error: "Película no encontrada" });
  // .filter() crea un nuevo array de actores SIN el actor indicado
  peli.actores = (peli.actores || []).filter(id => id !== req.params.actorId);
  await escribirJSON(PELIS_PATH, mdb);
  res.json(peli);
});

// DELETE /peliculas/:id → borra una película completa
app.delete("/peliculas/:id", async (req, res) => {
  const mdb = await leerJSON(PELIS_PATH);
  const idx = mdb.peliculas.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Película no encontrada" });
  const eliminado = mdb.peliculas.splice(idx, 1)[0];
  await escribirJSON(PELIS_PATH, mdb);
  res.json(eliminado); // Devolvemos la película borrada
});


/* ===================== ACTORES ===================== */

// GET /actores → lista todos los actores
app.get("/actores", async (req, res) => {
  const db = await leerJSON(ACTORES_PATH);  // Leemos el fichero actores.json
  res.json(db.actores);                     // Devolvemos el array de actores como JSON
});

// GET /actores/:id → devuelve un actor concreto por su id  (a_00x)
app.get("/actores/:id", async (req, res) => {
  const db = await leerJSON(ACTORES_PATH);
  const actor = db.actores.find(a => a.id === req.params.id); // Buscamos por id en la lista
  if (!actor) return res.status(404).json({ error: "Actor no encontrado" }); // Si no existe → 404
  res.json(actor);
});

// POST /actores → crea un nuevo actor
// Ejemplo de Body que hay que introducir: { "nombre": "Keanu Reeves", "nacimiento": 1964 }
app.post("/actores", async (req, res) => {
  const { nombre, nacimiento } = req.body || {};  // Extraemos campos del body
  if (!nombre || !Number.isInteger(nacimiento)) {
    // Validación básica: nombre string y nacimiento número entero
    return res.status(400).json({ error: "nombre (string) y nacimiento (int) requeridos" });
  }
  const db = await leerJSON(ACTORES_PATH);
  const nuevo = { id: nuevoId("a"), nombre, nacimiento }; // Creamos el nuevo objeto
  db.actores.push(nuevo);                               // Lo añadimos al array
  await escribirJSON(ACTORES_PATH, db);                 // Guardamos cambios en el fichero
  res.status(201).json(nuevo);                          // Respuesta 201 Created con el actor creado
});

// PATCH /actores/:id → modifica campos de un actor (parcialmente)
// Ejemplo de Body que hay que introducir: { "nombre": "Keanu Reeves", "nacimiento": 1964 }
app.patch("/actores/:id", async (req, res) => {
  const db = await leerJSON(ACTORES_PATH);          // Abrimos el fichero actores.json
  const actor = db.actores.find(a => a.id === req.params.id); // Buscamos el actor correspondiente al id introducido
  if (!actor) return res.status(404).json({ error: "Actor no encontrado" });

  const { nombre, nacimiento } = req.body || {};
  if (nombre !== undefined) actor.nombre = nombre;   // Si se manda nombre → actualizar
  if (nacimiento !== undefined) {                    // Si se manda nacimiento → validar y actualizar
    if (!Number.isInteger(nacimiento)) return res.status(400).json({ error: "nacimiento debe ser int" });
    actor.nacimiento = nacimiento;
  }
  await escribirJSON(ACTORES_PATH, db);
  res.json(actor);                                   // Devolvemos el actor actualizado
});

// DELETE /actores/:id → borra un actor y lo elimina de las películas
app.delete("/actores/:id", async (req, res) => {
  const adb = await leerJSON(ACTORES_PATH);
  const idx = adb.actores.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Actor no encontrado" });

  const eliminado = adb.actores.splice(idx, 1)[0];  // Quitamos el actor del array
  await escribirJSON(ACTORES_PATH, adb);            // Guardamos el fichero actores.json

  // Además, debemos quitarlo de todas las películas en las que aparezca
  const mdb = await leerJSON(PELIS_PATH);
  for (const p of mdb.peliculas) {
    p.actores = (p.actores || []).filter(id => id !== eliminado.id);
  }
  await escribirJSON(PELIS_PATH, mdb);

  res.json(eliminado);  // Devolvemos el actor eliminado
});



/* ===================== ARRANCAR SERVIDOR ===================== */
// Puerto donde escuchará nuestro servidor
const PORT = 3000;
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
