/**
 * PeaceRank Frontend Script
 * 
 * This script powers the interactive functionality for the PeaceRank demo webpage. 
 * It is responsible for:
 * 1. Loading example audience descriptions from a hosted JSON file.
 * 2. Allowing users to select examples or input their audience descriptions manually.
 * 3. Making API calls to the PeaceRank backend to generate results based on audience descriptions.
 * 4. Managing the UI components, such as loaders, dropdowns, and result containers.
 * 
 * Design Goals:
 * --------------
 * - Modularity: Functions are split into clear tasks to enhance readability and maintainability.
 * - Error Handling: Ensures that errors during API calls or data fetching are logged and communicated to users.
 * - Reusability: Generic utility functions like `displayMessage` and `displayResult` can be reused for other components.
 */


/**
 * Main Initialization
 * - Waits for the DOM to load, then initializes examples and event listeners.
 * - Ensures the page is fully ready before executing JavaScript, avoiding errors.
 */
document.addEventListener("DOMContentLoaded", () => {
    // Initialize the page by loading examples and setting up user input event listeners.
    loadExamples();
    setupEventListeners();
});

/**
 * Fetches example audience descriptions from a hosted JSON file and populates the dropdown.
 * This provides users with pre-defined examples to choose from, enhancing usability.
 */
async function loadExamples() {
    const dropdown = document.getElementById('examples-dropdown');
    const examplesURL = 'https://victorlavrenko.github.io/peacerank/examples.json';

    try {
        // Fetch example descriptions from the hosted file.
        const response = await fetch(examplesURL);
        if (!response.ok) throw new Error(`Failed to fetch examples: ${response.statusText}`);

        // Populate the dropdown with the fetched examples.
        const examples = await response.json();
        populateDropdown(dropdown, examples);
    } catch (error) {
        // Log the error and alert the user if examples could not be loaded.
        console.error('Error loading examples:', error);
        alert('Error loading examples: ' + error.message);
    }
}

/**
 * Populates the dropdown with example audience descriptions.
 * 
 * @param {HTMLElement} dropdown - The dropdown element to populate.
 * @param {Array} examples - Array of examples, each with `text` (description) and `label` (user-visible label).
 * 
 * Why?
 * -----
 * Dropdown population is separated into its own function to make it reusable and to
 * simplify the structure of `loadExamples()`.
 */
function populateDropdown(dropdown, examples) {
    dropdown.innerHTML = '<option value="" disabled selected>Choose an audience example</option>';
    examples.forEach(({ text, label }) => {
        const option = document.createElement('option');
        option.value = text; // Assign the actual example description as the value.
        option.textContent = label; // User-friendly label for the dropdown.
        dropdown.appendChild(option);
    });
}

/**
 * Sets up event listeners for the dropdown and textarea interactions.
 * Synchronizes dropdown selection with the audience description textarea.
 */
function setupEventListeners() {
    const dropdown = document.getElementById('examples-dropdown');
    const textarea = document.getElementById('audience-description');
    dropdown.addEventListener('change', () => (textarea.value = dropdown.value));
}

/**
 * Handles the API call to fetch PeaceRank results for a given audience description.
 * Validates the user input, displays loaders during the API call, and handles success/error scenarios.
 */
async function callAPI() {
    const descriptionTextarea = document.getElementById('audience-description');
    const description = descriptionTextarea.value.trim(); // Trim whitespace from user input.
    const loader = document.getElementById('loader');
    const container = document.getElementById('container');
    const peacerank = document.getElementById('peacerank');

    // First show the container element that spins and/or shows error message or result.
    container.style.display = 'block';

    // Input validation: Ensure the user has entered a description.
    if (!description) {
        displayMessage(peacerank, 'Please provide an audience description.', 'error');
        return;
    }

    try {
        // Show loading indicators.
        loader.style.display = 'block';
        peacerank.style.display = 'none';

        // Fetch the PeaceRank inference result from the backend API.
        const result = await fetchInference(description);

        // Display the result in the output container.
        displayResult(peacerank, result);
    } catch (error) {
        // Display an error message if the API call fails.
        displayMessage(peacerank, `Error: ${error.message}`, 'error');
    } finally {
        // Hide the loader and show the output container.
        loader.style.display = 'none';
        peacerank.style.display = 'block';
    }
}

/**
 * Makes a POST request to the PeaceRank API to fetch inference data.
 * 
 * @param {string} description - The user-provided audience description.
 * @returns {Object} - The JSON response containing the PeaceRank result and version.
 * @throws {Error} - If the API returns an error or the request fails.
 */
async function fetchInference(description) {
    const response = await fetch('https://8x5kn6g1qb.execute-api.eu-north-1.amazonaws.com/Prod/inference/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audience_description: description }),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || 'Unknown error');
    }

    return result;
}

/**
 * Displays the PeaceRank result in the output container.
 * Also appends the API version for transparency.
 * 
 * @param {HTMLElement} peacerank - The output container for displaying results.
 * @param {Object} result - The result object returned from the API.
 */
function displayResult(peacerank, result) {
    let output = result.result; // The main result from the API.
    if (result.version) {
        // Append the API version in a smaller font for clarity.
        output += `<br><p style="text-align: center"><small style="font-size: 12px; margin-left: 10px; color: gray;">API Version: ${result.version}</small></p>`;
    }
    peacerank.innerHTML = output;
}

/**
 * Displays a message in the output container.
 * Used for both error and informational messages.
 * 
 * @param {HTMLElement} element - The container where the message will be displayed.
 * @param {string} message - The message to display.
 * @param {string} [type='info'] - Type of message ('error' or 'info') to determine styling.
 */
function displayMessage(element, message, type = 'info') {
    const color = type === 'error' ? 'red' : 'black';
    const textAlign = type === 'error' ? 'center' : 'left'; // Center only for errors
    element.innerHTML = `<p style="color: ${color}; text-align: ${textAlign}; margin: 0;">${message}</p>`;
}
