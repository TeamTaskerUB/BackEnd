from flask import Flask
from Models.MySQLConnector import MySQLConnector

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


if __name__ == '__main__':
    #app.run()
    db = MySQLConnector("config.json")
    db.connect()

    # Ejecuta consultas o procedimientos almacenados
    db.execute_query("CREATE TABLE IF NOT EXISTS test_table (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255))")

    db.execute_query("INSERT INTO test_table (name) VALUES (%s)", ("Ejemplo",))

    data = db.fetch_data("SELECT * FROM test_table")
    print(data)

    # Cierra la conexión
    db.disconnect()