class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
        this.backendUrl = 'http://127.0.0.1:5000/calculate'; // Flask server URL
    }

    // Clear all data
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.history = [];
    }

    // Delete last digit
    delete() {
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') {
            this.currentOperand = '0';
        }
    }

    // Append a number or decimal point
    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    // Choose an operation (+, -, *, /, etc.)
    chooseOperation(operation) {
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute(); // Compute previous operation if any
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    // Apply a function (sin, cos, tan, exp)
    async applyFunction(funcName) {
        let value = parseFloat(this.currentOperand);
        if (isNaN(value)) {
            this.currentOperand = 'Error';
            this.previousOperand = '';
            this.operation = undefined;
            this.updateDisplay(); // Update display immediately for error
            return;
        }

        // Send request to backend for function calculation
        try {
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    operand1: value,
                    function: funcName
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentOperand = data.result;
                this.previousOperand = '';
                this.operation = undefined;
            } else {
                this.currentOperand = data.error || 'Error';
                this.previousOperand = '';
                this.operation = undefined;
            }
        } catch (e) {
            this.currentOperand = 'Network Error';
            this.previousOperand = '';
            this.operation = undefined;
        } finally {
            this.updateDisplay(); // Always update display
        }
    }


    // Compute the result (modified for backend call)
    async compute() {
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) && this.operation !== 'power') {
            return;
        }
        if (isNaN(current)) {
            this.currentOperand = 'Error';
            this.previousOperand = '';
            this.operation = undefined;
            this.updateDisplay();
            return;
        }

        // Send request to backend for computation
        try {
            const response = await fetch(this.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    operand1: prev,
                    operand2: current,
                    operation: this.operation
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentOperand = data.result;
                this.operation = undefined;
                this.previousOperand = '';
            } else {
                this.currentOperand = data.error || 'Error';
                this.operation = undefined;
                this.previousOperand = '';
            }
        } catch (e) {
            this.currentOperand = 'Network Error';
            this.operation = undefined;
            this.previousOperand = '';
        } finally {
            this.updateDisplay(); // Always update display
        }
    }

    // Get display number formatted
    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }
        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    // Update the display
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        if (this.operation != null) {
            this.previousOperandTextElement.innerText =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation === 'power' ? '^' : this.operation}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }
}

// Get all button elements
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operator]');
const functionButtons = document.querySelectorAll('[data-function]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');

// Create a new Calculator instance
const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

// Add event listeners for number buttons
numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.dataset.number);
        calculator.updateDisplay();
    });
});

// Add event listeners for operation buttons
operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.dataset.operator);
        calculator.updateDisplay();
    });
});

// Add event listeners for function buttons
functionButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Special handling for 'power' if it's an operator
        if (button.dataset.function === 'power') {
            calculator.chooseOperation('power');
        } else {
            calculator.applyFunction(button.dataset.function);
        }
        calculator.updateDisplay();
    });
});

// Add event listener for equals button
equalsButton.addEventListener('click', button => {
    calculator.compute();
});

// Add event listener for all clear button
allClearButton.addEventListener('click', button => {
    calculator.clear();
    calculator.updateDisplay();
});

// Add event listener for delete button
deleteButton.addEventListener('click', button => {
    calculator.delete();
    calculator.updateDisplay();
});

// Keyboard support
document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9' || e.key === '.') {
        calculator.appendNumber(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        calculator.chooseOperation(e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault(); // Prevent default Enter key behavior (e.g., form submission)
        calculator.compute();
    } else if (e.key === 'Backspace') {
        calculator.delete();
    } else if (e.key === 'Escape') { // 'Esc' for All Clear
        calculator.clear();
    }
    calculator.updateDisplay();
});
