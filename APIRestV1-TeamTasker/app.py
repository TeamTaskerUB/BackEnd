from flask import Flask, request, jsonify
from Models.MySQLConnector import MySQLConnector
import json

app = Flask(__name__)

# Ruta principal
@app.route('/')
def hello_world():
    return 'Hello World!'

# Ruta de login
@app.route('/auth/login', methods=['POST'])
def login():
    db = MySQLConnector("config.json")
    db.connect()

    # Obtén los datos del cuerpo de la solicitud
    user_data = request.get_json()
    username = user_data.get('username')
    password = user_data.get('password')

    # Valida que los campos username y password estén presentes
    if not username or not password:
        return jsonify({"error": "Faltan credenciales"}), 400

    # Consulta para validar el usuario
    query = "SELECT * FROM users WHERE username = %s AND password = %s"
    result = db.fetch_data(query, (username, password))

    # Verifica si el usuario existe
    if result:
        return jsonify({"message": "Login exitoso", "user": result}), 200
    else:
        return jsonify({"error": "Credenciales incorrectas"}), 401

if __name__ == '__main__':
    db = MySQLConnector("config.json")
    db.connect()

    # Ejecuta consultas o procedimientos almacenados
    db.execute_query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255))")

    db.disconnect()
    app.run(debug=True)
