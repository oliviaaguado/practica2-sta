// Referencias a elementos HTML
const input = document.getElementById("title");
const button = document.getElementById("searchBtn");
const result = document.getElementById("result");

// Clave de la API de OMDb
const API_KEY = "4fca5c91";

button.addEventListener("click", async () => {
  const titulo = input.value.trim();
  if (!titulo) {
    result.innerHTML = "<p>Por favor, introduce un título.</p>";
    return;
  }

  result.innerHTML = "Buscando…";

  try {
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(titulo)}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === "False") {
      result.innerHTML = `<p>No encontrada: ${data.Error}</p>`;
      return;
    }

    result.innerHTML = `
      <h2>${data.Title} (${data.Year})</h2>
      <p><strong>Director:</strong> ${data.Director}</p>
      ${data.Poster && data.Poster !== "N/A" ? `<img src="${data.Poster}" alt="Póster">` : ""}
    `;
  } catch (error) {
    result.innerHTML = `<p>Error al obtener datos: ${error}</p>`;
  }
});
