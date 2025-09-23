// Obtengo referencias del texto introducido y del botón
const input = document.getElementById('title');
const button = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');

// Inicio proceso de cuado se hace click sobre el botón
button.addEventListener('click', async () => {
    const titulo = input.value;

    const apikey = "10332218";
    const url = `https://www.omdbapi.com/?apikey=${apikey}&t=${encodeURIComponent(titulo)}`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Si no encuentra la peli
            if (data.Response === "False") {
                resultDiv.textContent = "Pelicula no encontrada";
                return;
            }

            // Si encuentra muestro año y director
            resultDiv.innerHTML = `
                <p>Director: ${data.Director}</p>
                <p>Year: ${data.Year}</p>
            `;
        })
        .catch(err => {
            console.error("Error en la petición:", err);
            resultDiv.textContent = "Error al consultar la API";
        });

    


    
})