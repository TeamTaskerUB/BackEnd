from flask import Flask, request, jsonify
from Models.SQLiteConnector import SQLiteConnector

app = Flask(__name__)

# Ruta principal
@app.route('/')
def hello_world():
    return 'Hello World!'

# Ruta de login
@app.route('/auth/login', methods=['POST'])
def login():
    db = SQLiteConnector("config.json")
    db.connect()

    # Obtén los datos del cuerpo de la solicitud
    user_data = request.get_json()
    username = user_data.get('username')
    password = user_data.get('password')

    # Valida que los campos username y password estén presentes
    if not username or not password:
        return jsonify({"error": "Faltan credenciales"}), 400

    # Consulta para validar el usuario
    query = "SELECT * FROM users WHERE username = ? AND password = ?"
    result = db.fetch_data(query, (username, password))

    # Verifica si el usuario existe
    if result:
        return jsonify({"message": "Login exitoso", "user": result}), 200
    else:
        return jsonify({"error": "Credenciales incorrectas"}), 401

# Ruta de registro
@app.route('/auth/register', methods=['POST'])
def register():
    db = SQLiteConnector("config.json")
    db.connect()

    # Obtén los datos del cuerpo de la solicitud
    user_data = request.get_json()
    username = user_data.get('username')
    password = user_data.get('password')

    # Valida que los campos username y password estén presentes
    if not username or not password:
        return jsonify({"error": "Faltan datos"}), 400

    # Verificar si el nombre de usuario ya existe
    existing_user = db.fetch_data("SELECT * FROM users WHERE username = ?", (username,))
    if existing_user:
        return jsonify({"error": "El nombre de usuario ya existe"}), 409

    # Insertar el nuevo usuario en la base de datos
    insert_query = "INSERT INTO users (username, password) VALUES (?, ?)"
    db.execute_query(insert_query, (username, password))

    return jsonify({"message": "Usuario registrado exitosamente"}), 201

if __name__ == '__main__':
    db = SQLiteConnector("config.json")
    db.connect()

    # Crea la tabla de usuarios si no existe
    db.execute_query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT)")

    db.disconnect()
    app.run(debug=True)
