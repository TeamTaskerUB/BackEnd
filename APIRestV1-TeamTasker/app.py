from flask import Flask, request, jsonify
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from Models.MySQLConnector import MySQLConnector
from Models.Usuarios import Usuario

app = Flask(__name__)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(email):
    # Intentamos iniciar sesión en la base de datos buscando al usuario
    return Usuario.get_by_email(email)

@app.route('/register', methods=['POST'])
def register():
    datos = request.get_json()
    username = datos.get('mail')
    password = datos.get('password')
    name = datos.get ('nombre')
    apellido = datos.get('apellido')
    perfil = datos.get('perfil')

    response = Usuario.register(username, password, name, apellido)
    return response

@app.route('/register', methods=['GET'])
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
def hello_world():  # put application's code here
    return 'Hello World!'

if __name__ == '__main__':
    #app.run()
    db = MySQLConnector("config.json")
    db.connect()