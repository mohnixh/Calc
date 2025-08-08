let currentInput = '';
let result = '0';

const inputDisplay = document.querySelector('.input_display');
const resultDisplay = document.querySelector('.result_display');
const buttons = document.querySelector('.buttons');
const bunny = document.querySelector('.bunny');
if (bunny) bunny.addEventListener('click', () => alert("Hi, welcome to my Calculator, enjoy calculating"));

function updateDisplay() {
    inputDisplay.textContent = currentInput;
    resultDisplay.textContent = result;
}

function addInput(value) {
    if (value === '➗') value = '/';
    if (value === '✖️') value = '*';
    if (value === '➖') value = '-';
    if (value === '➕') value = '+';
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

function isDigitDot(ch) {
    return ch >= '0' && ch <= '9' || ch === '.';
}

function insertImplicitMultiplication(expression) {
    let out = '';
    let lastNonSpace = null;

    function isOperator(c) {
        return c === '+' || c === '-' || c === '*' || c === '/' || c === '^';
    }

    for (let i = 0; i < expression.length; i++) {
        const ch = expression[i];
        out += ch;
        if (ch !== ' ') lastNonSpace = ch;

        let j = i + 1;
        while (j < expression.length && expression[j] === ' ') j++;
        if (j >= expression.length) continue;
        const next = expression[j];

        if (!lastNonSpace || !next) continue;

        const leftIsDigit = isDigitDot(lastNonSpace);
        const rightIsDigit = isDigitDot(next);

        if (leftIsDigit && rightIsDigit) continue;

        if (lastNonSpace === '√' && rightIsDigit) continue;

        const leftIsValue = leftIsDigit || lastNonSpace === ')' || lastNonSpace === '%' || lastNonSpace === '√';
        const rightIsValue = rightIsDigit || next === '(' || next === '√';

        if (leftIsValue && rightIsValue && !isOperator(lastNonSpace)) {
            out += '*';
            lastNonSpace = '*';
        }
    }

    return out;
}

function squareRoot(expression) {
    let s = expression;
    while (s.includes('√')) {
        let idx = s.indexOf('√');
        if (idx === -1) break;
        const next = s[idx + 1];

        if (next === '(') {

            let p = idx + 1;
            let count = 0;
            let close = -1;
            for (; p < s.length; p++) {
                if (s[p] === '(') count++;
                else if (s[p] === ')') count--;
                if (count === 0) { close = p; break; }
            }
            if (close === -1) break; // mismatched
            const inside = s.slice(idx + 2, close);
            const replacement = 'Math.sqrt(' + inside + ')';
            s = s.slice(0, idx) + replacement + s.slice(close + 1);
        } else {
          
            let j = idx + 1;
            while (j < s.length && isDigitDot(s[j])) j++;
            if (j === idx + 1) break; 
            const num = s.slice(idx + 1, j);
            const replacement = 'Math.sqrt(' + num + ')';
            s = s.slice(0, idx) + replacement + s.slice(j);
        }
    }
    return s;
}

function handlePercentages(expression) {
    let s = expression;
    let i = 0;
    while (i < s.length) {
        if (s[i] === '%') {
            const beforeSpace = i > 0 && s[i - 1] === ' ';
            const afterSpace = i < s.length - 1 && s[i + 1] === ' ';
            if (beforeSpace || afterSpace) { i++; continue; }

            let start = i - 1;
            if (start < 0) { i++; continue; }

            if (s[start] === ')') {
                let count = 1;
                let p = start - 1;
                while (p >= 0 && count > 0) {
                    if (s[p] === ')') count++;
                    else if (s[p] === '(') count--;
                    p--;
                }
                start = (p >= 0 ? p + 1 : 0);
            } else {
                while (start >= 0 && isDigitDot(s[start])) start--;
                start++;
            }

            if (start > i - 1) { i++; continue; }
            const numberText = s.slice(start, i);

            let after = i + 1;
            while (after < s.length && s[after] === ' ') after++;
            const nextChar = after < s.length ? s[after] : '';

            const needMultiply = nextChar !== '' && (isDigitDot(nextChar) || nextChar === '(' || nextChar === '√');
            const replacement = '(' + numberText + '/100)' + (needMultiply ? '*' : '');
            s = s.slice(0, start) + replacement + s.slice(after);
            i = start + replacement.length;
            continue;
        } else {
            i++;
        }
    }
    return s;
}

function handleExponents(expression) {
    let s = expression;
    while (s.includes('^')) {
        let idx = s.indexOf('^');
        if (idx === -1) break;

        let leftEnd = idx;
        let leftStart = leftEnd - 1;
        while (leftStart >= 0 && s[leftStart] === ' ') leftStart--;
        if (leftStart < 0) break;

        if (s[leftStart] === ')') {
            let count = 1;
            let p = leftStart - 1;
            while (p >= 0 && count > 0) {
                if (s[p] === ')') count++;
                else if (s[p] === '(') count--;
                p--;
            }
            leftStart = Math.max(0, p + 1);
        } else {
            while (leftStart >= 0 && (isDigitDot(s[leftStart]) || (s[leftStart] === '-' && (leftStart === 0 || "+-*/(^".includes(s[leftStart - 1]))))) {
                leftStart--;
            }
            leftStart++;
        }
        const base = s.slice(leftStart, leftEnd).trim();

        let rightStart = idx + 1;
        while (rightStart < s.length && s[rightStart] === ' ') rightStart++;
        if (rightStart >= s.length) break;

        let rightEnd = rightStart;
        if (s[rightStart] === '(') {
            let count = 1;
            rightEnd = rightStart + 1;
            while (rightEnd < s.length && count > 0) {
                if (s[rightEnd] === '(') count++;
                else if (s[rightEnd] === ')') count--;
                rightEnd++;
            }
        } else {
            if (s[rightEnd] === '-') rightEnd++;
            while (rightEnd < s.length && isDigitDot(s[rightEnd])) rightEnd++;
        }
        const exponent = s.slice(rightStart, rightEnd).trim();

        if (base === '' || exponent === '') break;

        s = s.slice(0, leftStart) + '(' + base + ')**(' + exponent + ')' + s.slice(rightEnd);
    }
    return s;
}

function calculate() {
    try {
        if (currentInput === '') return;
        let order = currentInput;

        const validCharacters = '0123456789+-*/().^√% ';
        for (let ch of order) {
            if (!validCharacters.includes(ch)) {
                result = 'Invalid';
                updateDisplay();
                return;
            }
        }
y
        order = insertImplicitMultiplication(order);

        order = squareRoot(order);

        order = handlePercentages(order);

        order = handleExponents(order);

        order = insertImplicitMultiplication(order);

        let calculatedResult = Function('"use strict"; return (' + order + ')')();
        if (typeof calculatedResult === 'number' && !isNaN(calculatedResult)) {
            result = calculatedResult.toString();
        } else {
            result = 'Error';
        }
    } catch (err) {
        console.error('Calc error:', err);
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
