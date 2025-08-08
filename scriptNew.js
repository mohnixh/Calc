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

function squareRoot(expression) {
    let result = expression;

    while (result.includes('√')) {
        let squareRootIndex = result.indexOf('√');

        let nextChar = result[squareRootIndex + 1];

        if (nextChar === '(') {
            let openBracketIndex = squareRootIndex + 1;
            let closeBracketIndex = -1;
            let bracketCount = 0;

            for (let i = openBracketIndex; i < result.length; i++) {
                let currentChar = result[i];

                if (currentChar === '(') {
                    bracketCount++;
                }
                if (currentChar === ')') {
                    bracketCount--;
                }
                if (bracketCount === 0) {
                    closeBracketIndex = i;
                    break;
                }
            }

            let contentStart = openBracketIndex + 1;
            let contentEnd = closeBracketIndex;
            let content = result.slice(contentStart, contentEnd);

            let replacement = 'Math.sqrt(' + content + ')';

            let beforeSquareRoot = result.slice(0, squareRootIndex);
            let afterClosingBracket = result.slice(closeBracketIndex + 1);

            result = beforeSquareRoot + replacement + afterClosingBracket;

        } else {
            let numberStart = squareRootIndex + 1;
            let numberEnd = numberStart;

            while (numberEnd < result.length) {
                let char = result[numberEnd];
                if ((char >= '0' && char <= '9') || char === '.') {
                    numberEnd++;
                }
                else {
                    break;
                }
            }

            let number = result.slice(numberStart, numberEnd);

            let replacement = 'Math.sqrt(' + number + ')';
            let beforeSquareRoot = result.slice(0, squareRootIndex);
            let afterNumber = result.slice(numberEnd);

            result = beforeSquareRoot + replacement + afterNumber;
        }
    }
    return result;
}

function handleExponents(expression) {
    let result = expression;

    while (result.includes('^')) {
        let index = result.indexOf('^');

        let leftStart = index - 1;
        while (leftStart >= 0 && ("0123456789.".includes(result[leftStart]) || result[leftStart] === ')')) {
            leftStart--;
        }
        leftStart++;

        let rightEnd = index + 1;
        while (rightEnd < result.length && ("0123456789.".includes(result[rightEnd]) || result[rightEnd] === '(')) {
            rightEnd++;
        }

        let left = result.slice(leftStart, index);
        let right = result.slice(index + 1, rightEnd);

        let replacement = '(' + left + ')**(' + right + ')';
        result = result.slice(0, leftStart) + replacement + result.slice(rightEnd);
    }

    return result;
}

function handlePercentages(expression) {
    let result = expression;

    for (let i = 0; i < result.length; i++) {
        if (result[i] === '%') {
            let numStart = i - 1;
            while (numStart >= 0 && ("0123456789.".includes(result[numStart]))) {
                numStart--;
            }
            numStart++;
            let number = result.slice(numStart, i);
            result = result.slice(0, numStart) + '(' + number + '/100)' + result.slice(i + 1);
            i += 6; // skip past inserted text
        }
    }

    return result;
}

function calculate() {
    try {
        if (currentInput === '') return;

        let order = currentInput;

        const validCharacters = '0123456789+-*/().^√% ';
        for (let char of order) {
            if (!validCharacters.includes(char)) {
                result = 'Invalid';
                updateDisplay();
                return;
            }
        }

        order = squareRoot(order);
        order = handleExponents(order);
        order = handlePercentages(order);

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
