// script.js - SECTION 1: Get all DOM elements by ID (Required)
const countryInput = document.getElementById('country-input');
const searchBtn = document.getElementById('search-btn');
const loadingSpinner = document.getElementById('loading-spinner');
const countryInfo = document.getElementById('country-info');
const borderingCountries = document.getElementById('bordering-countries');
const errorMessage = document.getElementById('error-message');

// section 2: set up event listeners
searchBtn.addEventListener('click', function() {
    const countryName = countryInput.value.trim(); // FIXED: was ariaValueMax

    if (countryName) {
        // If yes, call the search function
        searchCountry(countryName);
    } else {
        // If empty, show error message
        errorMessage.textContent = 'Please enter a country name';
        errorMessage.classList.remove('hidden'); // Make error visible
    }  
     
});

// When user presses ENTER key while typing
countryInput.addEventListener('keypress', function(e) {
    // Check if the key pressed was Enter
    if (e.key === 'Enter') {
        // Get what user typed
        const countryName = countryInput.value.trim();
        
        if (countryName) {
            searchCountry(countryName);
        } else {
            errorMessage.textContent = 'Please enter a country name';
            errorMessage.classList.remove('hidden');
        }
    }
});

//Section3: Main search function - async/await and try/catch
async function searchCountry(countryName) {
    //  'async' means this function can pause and wait for API
    
    // Show loading spinner, hide old results
    loadingSpinner.classList.remove('hidden');  // Show spinner
    countryInfo.classList.add('hidden');        // Hide old country info
    borderingCountries.classList.add('hidden'); // Hide old borders
    errorMessage.classList.add('hidden');       // Hide old errors
    
    try {
        // try { } = Attempt this code, if it fails, go to catch
        
        // FETCH API - REQUIRED (10 points)
        // This is the actual API call to REST Countries
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        //  'await' pauses here until API responds
        //  fetch() gets data from the internet
        
        // Check if country was found (404 = not found)
        if (!response.ok) {
            throw new Error('Country not found'); // This jumps to catch
        }
        
        // Convert response to JSON format
        const data = await response.json();
        //  JSON is like a JavaScript object we can use
        
        // Get the first country from results
        const country = data[0];
        //  API returns array, we take first item
        
        // ===== Display main country info =====
        // Format population with commas (e.g., 59308690 → "59,308,690")
        const population = country.population.toLocaleString();
        
        // Handle countries with no capital (some don't have one)
        const capital = country.capital ? country.capital[0] : 'No capital';
        
        // UPDATE DOM - REQUIRED (10 points)
        // ✅ FIXED: NO DIVS - Using semantic HTML only
        countryInfo.innerHTML = `
            <article class="country-card">
                <header>
                    <h2>${country.name.common}</h2>
                </header>
                
                <figure>
                    <img src="${country.flags.svg}" alt="${country.name.common} flag" width="100">
                    <figcaption>Flag of ${country.name.common}</figcaption>
                </figure>
                
                <ul class="country-details">
                    <li><strong>Capital:</strong> ${capital}</li>
                    <li><strong>Population:</strong> ${population}</li>
                    <li><strong>Region:</strong> ${country.region}</li>
                </ul>
            </article>
        `;
        //  innerHTML = completely replace content inside this element
        
        countryInfo.classList.remove('hidden'); // Make it visible
        
        // ===== Handle bordering countries =====
        // Check if country has borders
        if (country.borders && country.borders.length > 0) {
            // If yes, fetch each neighbor
            // ✅ FIXED: Using header instead of div for heading
            let borderHTML = '<header><h3>Bordering Countries</h3></header>';
            
            // ✅ FIXED: Using ul for list (semantic)
            borderHTML += '<ul class="border-countries-list">';
            
            // Loop through each border code (e.g., "BWA", "ZAF")
            for (let code of country.borders) {
                // Fetch each neighbor by its 3-letter code
                const borderResponse = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
                const borderData = await borderResponse.json();
                const borderCountry = borderData[0];
                
                // ✅ FIXED: Using li with figure (NO DIVS, NO SPANS)
                borderHTML += `
                    <li class="border-country-item">
                        <figure>
                            <img src="${borderCountry.flags.svg}" alt="${borderCountry.name.common} flag" width="30">
                            <figcaption>${borderCountry.name.common}</figcaption>
                        </figure>
                    </li>
                `;
            }
            
            borderHTML += '</ul>';
            borderingCountries.innerHTML = borderHTML;
            borderingCountries.classList.remove('hidden');
        } else {
            // Country has no borders (like Japan, Australia)
            // ✅ FIXED: Using article instead of div
            borderingCountries.innerHTML = `
                <article class="no-borders-message">
                    <p>This country has no land borders.</p>
                </article>
            `;
            borderingCountries.classList.remove('hidden');
        }
        
    } catch (error) {
        //  catch runs if anything in try fails
        // This includes: network errors, country not found, etc.
        
        errorMessage.innerHTML = `
            <article class="error-content">
                <p><strong>Error:</strong> ${error.message}. Please try another country.</p>
            </article>
        `;
        errorMessage.classList.remove('hidden');
        
    } finally {
        //  finally ALWAYS runs, whether success or failure
        
        // Hide loading spinner
        loadingSpinner.classList.add('hidden');
    }
}
