# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS # Needed for cross-origin requests

# Assuming your ScientificCalculator class is in calculator_logic.py
# If it's in the same file, you can define it here.
import math

class ScientificCalculator:
    # ... (Your existing ScientificCalculator class methods: add, subtract, sin, etc.)
    """
    A class to perform basic arithmetic, trigonometric, and exponential calculations.
    """

    def add(self, a, b):
        """Adds two numbers."""
        return a + b

    def subtract(self, a, b):
        """Subtracts two numbers."""
        return a - b

    def multiply(self, a, b):
        """Multiplies two numbers."""
        return a * b

    def divide(self, a, b):
        """Divides two numbers. Handles division by zero."""
        if b == 0:
            raise ValueError("Error: Division by zero is not allowed.")
        return a / b

    def sin(self, x_degrees):
        """Calculates the sine of an angle given in degrees."""
        return math.sin(math.radians(x_degrees))

    def cos(self, x_degrees):
        """Calculates the cosine of an angle given in degrees."""
        return math.cos(math.radians(x_degrees))

    def tan(self, x_degrees):
        """Calculates the tangent of an angle given in degrees."""
        # Check for angles where tangent is undefined (90 + 180k degrees)
        if (x_degrees % 180 == 90) or (x_degrees % 180 == -90):
            raise ValueError("Error: Tangent is undefined for this angle.")
        return math.tan(math.radians(x_degrees))

    def exp(self, x):
        """Calculates the exponential function (e^x)."""
        return math.exp(x)

    def power(self, base, exponent):
        """Calculates base raised to the power of exponent."""
        return math.pow(base, exponent)


app = Flask(__name__)
CORS(app) # Enable CORS so your frontend (running on different origin) can access it
calculator = ScientificCalculator()

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    operand1 = data.get('operand1')
    operand2 = data.get('operand2')
    operation = data.get('operation')
    func_name = data.get('function') # For functions like sin, cos

    result = None
    error = None

    try:
        if operation:
            if operation == '+':
                result = calculator.add(operand1, operand2)
            elif operation == '-':
                result = calculator.subtract(operand1, operand2)
            elif operation == '*':
                result = calculator.multiply(operand1, operand2)
            elif operation == '/':
                result = calculator.divide(operand1, operand2)
            elif operation == 'power': # x^y is treated as a binary operation
                result = calculator.power(operand1, operand2)
        elif func_name:
            if func_name == 'sin':
                result = calculator.sin(operand1)
            elif func_name == 'cos':
                result = calculator.cos(operand1)
            elif func_name == 'tan':
                result = calculator.tan(operand1)
            elif func_name == 'exp':
                result = calculator.exp(operand1)

    except ValueError as e:
        error = str(e)
    except Exception as e:
        error = "Calculation error: " + str(e)

    if error:
        return jsonify({'error': error}), 400 # Bad request
    else:
        return jsonify({'result': result})

if __name__ == '__main__':
    # You would run this Flask app in your terminal: python app.py
    # It will typically run on http://127.0.0.1:5000/ by default
    app.run(debug=True, port=5000)
