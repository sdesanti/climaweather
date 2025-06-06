const API_KEY = 'f6b2465ea16fdc3833edde69097b7258'; // Es crucial mantener esta API Key en un lugar seguro en una app real.
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const weatherInfoDiv = document.getElementById('weather-info');
const errorMessageDiv = document.getElementById('error-message');

/**
 * Muestra un estado de carga en la interfaz.
 * @param {string} message - Mensaje a mostrar durante la carga.
 */
function showLoadingState(message) {
    weatherInfoDiv.innerHTML = `<p class="placeholder-text loading-state"><i class="fas fa-spinner fa-spin"></i> ${message}</p>`;
    errorMessageDiv.textContent = '';
}

/**
 * Muestra los datos del clima en la interfaz.
 * @param {object} data - Objeto de datos del clima de la API.
 */
function displayWeatherData(data) {
    const { name, main, weather, wind } = data;
    const weatherDescription = weather[0].description;
    const iconCode = weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`; // Mayor resolución para los íconos

    weatherInfoDiv.innerHTML = `
        <img src="${iconUrl}" alt="${weatherDescription}" class="weather-icon">
        <h2>${name}</h2>
        <p class="temperature">${Math.round(main.temp)}°C</p>
        <p class="description">${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}</p>
        <p>Humedad: ${main.humidity}%</p>
        <p>Viento: ${wind.speed} m/s</p>
    `;
    errorMessageDiv.textContent = ''; // Limpiar mensaje de error
}

/**
 * Muestra un mensaje de error en la interfaz.
 * @param {string} message - Mensaje de error a mostrar.
 */
function displayError(message) {
    errorMessageDiv.textContent = message;
    weatherInfoDiv.innerHTML = '<p class="placeholder-text">Ingresa una ciudad o usa tu ubicación para ver el clima.</p>'; // Restaurar placeholder
}

/**
 * Obtiene los datos del clima de OpenWeatherMap por ciudad.
 * @param {string} city - Nombre de la ciudad.
 */
async function getWeatherDataByCity(city) {
    showLoadingState('Cargando clima para ' + city + '...');
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=es`);
        const data = await response.json();

        if (data.cod === '404') {
            throw new Error('Ciudad no encontrada. Por favor, verifica el nombre e intenta de nuevo.');
        }
        if (data.cod !== 200) {
            throw new Error(data.message || 'Error al obtener los datos del clima. Intenta de nuevo más tarde.');
        }

        displayWeatherData(data);
    } catch (error) {
        console.error('Error al obtener el clima por ciudad:', error);
        displayError(error.message);
    }
}

/**
 * Obtiene los datos del clima de OpenWeatherMap por coordenadas.
 * @param {number} lat - Latitud.
 * @param {number} lon - Longitud.
 */
async function getWeatherDataByCoords(lat, lon) {
    showLoadingState('Obteniendo el clima de tu ubicación actual...');
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`);
        const data = await response.json();

        if (data.cod !== 200) {
            throw new Error(data.message || 'Error al obtener los datos del clima por ubicación. Intenta de nuevo más tarde.');
        }

        displayWeatherData(data);
    } catch (error) {
        console.error('Error al obtener el clima por coordenadas:', error);
        displayError(error.message);
    }
}

// Evento para el botón de búsqueda
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherDataByCity(city);
    } else {
        displayError('Por favor, ingresa el nombre de una ciudad para buscar.');
    }
});

// Evento para el botón de ubicación actual
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoadingState('Obteniendo tu ubicación...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                getWeatherDataByCoords(latitude, longitude);
            },
            (error) => {
                let msg = 'Error al obtener la ubicación: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        msg += 'Permiso denegado por el usuario. Por favor, habilita la ubicación en la configuración de tu navegador.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg += 'Información de ubicación no disponible. Intenta de nuevo más tarde.';
                        break;
                    case error.TIMEOUT:
                        msg += 'Tiempo de espera agotado al intentar obtener la ubicación. Verifica tu conexión.';
                        break;
                    default:
                        msg += 'Un error desconocido ocurrió.';
                }
                displayError(msg);
            },
            {
                enableHighAccuracy: true, // Solicita la mejor precisión posible
                timeout: 10000,          // Tiempo máximo para obtener la ubicación (10 segundos)
                maximumAge: 0            // No usar una posición en caché
            }
        );
    } else {
        displayError('Tu navegador no soporta la geolocalización. Intenta buscar por nombre de ciudad.');
    }
});

// Permitir búsqueda al presionar "Enter" en el campo de texto
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});

// Cargar un clima inicial al cargar la página (opcional)
document.addEventListener('DOMContentLoaded', () => {
    // Puedes cargar un clima por defecto o intentar usar la ubicación
    // getWeatherDataByCity('Santiago');
});