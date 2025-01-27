document.addEventListener("DOMContentLoaded", () => {
    loadExamples();
    setupEventListeners();
});

async function loadExamples() {
    const dropdown = document.getElementById('examples-dropdown');
    const examplesURL = 'https://victorlavrenko.github.io/peacerank/examples.json';

    try {
        const response = await fetch(examplesURL);
        if (!response.ok) throw new Error(`Failed to fetch examples: ${response.statusText}`);
        
        const examples = await response.json();
        populateDropdown(dropdown, examples);
    } catch (error) {
        console.error('Error loading examples:', error);
        alert('Error loading examples: ' + error.message);
    }
}

function populateDropdown(dropdown, examples) {
    dropdown.innerHTML = '<option value="" disabled selected>Choose an audience example</option>';
    examples.forEach(({ text, label }) => {
        const option = document.createElement('option');
        option.value = text;
        option.textContent = label;
        dropdown.appendChild(option);
    });
}

function setupEventListeners() {
    const dropdown = document.getElementById('examples-dropdown');
    const textarea = document.getElementById('audience-description');
    dropdown.addEventListener('change', () => (textarea.value = dropdown.value));
}

async function callAPI() {
    const descriptionTextarea = document.getElementById('audience-description');
    const description = descriptionTextarea.value.trim();
    const loader = document.getElementById('loader');
    const container = document.getElementById('container');
    const peacerank = document.getElementById('peacerank');

    if (!description) {
        displayMessage(peacerank, 'Please provide an audience description.', 'error');
        return;
    }

    try {
        container.style.display = 'block';
        loader.style.display = 'block';
        peacerank.style.display = 'none';

        const result = await fetchInference(description);

        displayResult(peacerank, result, description);
    } catch (error) {
        displayMessage(peacerank, `Error: ${error.message}`, 'error');
    } finally {
        loader.style.display = 'none';
        peacerank.style.display = 'block';
    }
}

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

function displayResult(peacerank, result, description) {
    let output = result.result;
    if (result.version) {
        output += `<br><p style="text-align: center"><small style="font-size: 12px; margin-left: 10px; color: gray;">API Version: ${result.version}</small></p>`;
    }
    peacerank.innerHTML = output;
}

function displayMessage(element, message, type = 'info') {
    const color = type === 'error' ? 'red' : 'black';
    element.innerHTML = `<p style="color: ${color}; text-align: center; margin: 0;">${message}</p>`;
}