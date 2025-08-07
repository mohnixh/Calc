let currentInput = '';
let result = '0';

const inputDisplay = document.querySelector('.input_display');
const resultDisplay = document.querySelector('.result_display');
const buttons = document.querySelector('.buttons');
const bunny = document.querySelector('.bunny');
bunny.addEventListener('click', () => alert("Hi, welcome to my Calculator, enjoy calculating"));

function updateDisplay() {
    inputDisplay.textContent = currentInput;
    resultDisplay.textContent = result;
}

function addInput(value) {
    if (value === '➗') value = '/';
    if (value === '✖️') value = '*';
    if (value === '➖') value = '-';
    if (value === '➕') value = '+';
    if (value === '%') value = '%';

    currentInput += value;
    updateDisplay();
}

function clearAll() {
    currentInput = '';
    result = '0';
    updateDisplay();
}

function deleteLast() {
    currentInput = currentInput.slice(0, -1);
    if (currentInput === '') result = '0';
    updateDisplay();
}

function calculate() {
    try {
        if (currentInput === '') return;

        let order = currentInput;

        if (/[^0-9+\-*/().^√% ]/.test(order)) {
            result = 'Invalid';
            updateDisplay();
            return;
        }

        order = order.replace(/√\(([^)]+)\)/g, 'Math.sqrt($1)');
        order = order.replace(/√(\d+(\.\d+)?)/g, 'Math.sqrt($1)');
        order = order.replace(/(-?\d+(?:\.\d+)?)\s*\^\s*(-?\d+(?:\.\d+)?)/g, '($1)**($2)');
        order = order.replace(/(\d+(\.\d+)?)%(?!\d)/g, '($1/100)');

        let calculatedResult = Function('"use strict"; return (' + order + ')')();

        if (typeof calculatedResult === 'number' && !isNaN(calculatedResult)) {
            result = calculatedResult.toString();
        } else {
            result = 'Error';
        }
    } catch (error) {
        result = 'Error';
    }

    updateDisplay();
}

buttons.addEventListener('click', function (event) {
    const clickedButton = event.target;
    const buttonText = clickedButton.textContent;

    if (clickedButton.classList.contains('input')) {
        addInput(buttonText);
    } else if (buttonText === 'C') {
        clearAll();
    } else if (buttonText === '⌦') {
        deleteLast();
    } else if (buttonText === '=') {
        calculate();
    }
});

updateDisplay();
