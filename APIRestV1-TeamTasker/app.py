from flask import Flask, request, jsonify
from flask_login import LoginManager, login_required, logout_user, login_user, current_user
from Models.MySQLConnector import MySQLConnector
from Models.Usuarios import Usuario

app = Flask(__name__)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(email):
    # Intentamos iniciar sesión en la base de datos buscando al usuario
    return Usuario.get_by_email(email)

@app.route('/auth/register', methods=['POST'])
def register():
    user_data = request.get_json()

    username = user_data.get('mail')
    password = user_data.get('password')
    name = user_data.get ('nombre')
    apellido = user_data.get('apellido')

    response = Usuario.register(username, password, name, apellido)
    return response

@app.route('/auth/login', methods=['GET'])
def login():
    datos = request.get_json()
    username = datos.get('mail')
    password = datos.get('password')

    user, error_response = Usuario.login(username, password)
    if user:
        login_user(user) #Metodo Flask de inicio de sesion
        return jsonify({"message": "Bienvenido, {}".format(user.nombre)}), 200
    else:
        return error_response

@app.route('/logout', methods=['GET'])
@login_required
def logout():
    logout_user()
    return jsonify({"mensaje": "Cierre de sesión."}), 200

@app.route('/protected', methods=['GET'])
@login_required
def protected():
    return jsonify({"mensaje": "Acceso permitido para el usuario {}".format(current_user.email)}), 200

@app.route('/')
def hello_world():
    return 'Hello World!'

if __name__ == '__main__':
    app.run(debug=True)
    db = MySQLConnector("config.json")
    db.connect()

    # db.execute_query("INSERT INTO persona (name) VALUES (%s)", ("Lucio Aymonino",))
    # data = db.fetch_data("SELECT * FROM persona")
    # print(data)
    # Cierra la conexión

    # Prueba de Registro
    nuevo_usuario = Usuario.register(
        mail="usuario@example.com",
        nombre_completo="Nombre Completo",
        contraseña="password123",
        perfil="usuario"
    )
    if nuevo_usuario:
        print(f"Usuario registrado: {nuevo_usuario.nombre_completo}")
    #
    # # Prueba de Login
    # usuario_iniciado = Usuario.login(
    #     email="usuario@example.com",
    #     contraseña="password123"
    # )
    # if usuario_iniciado:
    #     print(f"Inicio de sesión exitoso para: {usuario_iniciado.nombre_completo}")
    # else:
    #     print("Error en el inicio de sesión.")

