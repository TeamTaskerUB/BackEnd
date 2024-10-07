from flask import Flask, request, jsonify
from Models.MySQLConnector import MySQLConnector
from Models.Usuarios import *
from Models.Tareas import *

app = Flask(__name__)

# Endpoint para que el Administrador de Proyecto cree una tarea grupal, usando el id del proyecto en la ruta
@app.route('/proyectos/<int:idProyecto>/crear_tarea_grupal', methods=['POST'])
def crearTareaGrupal(idProyecto):
    #Primero chequear que la solicitud sea un post
    if request.method == 'POST':
        data = request.json
        idUsuario = data['idUsuario']

        # Se realizara una consulta para verificar que el usuario sea el admin de Proyecto.
        query = """SELECT admin_id FROM tareaglobal WHERE idProyecto = %s"""
        result = db.fetch_data(query, (idProyecto,))
        print(result)
        if not (result[0][0] == idUsuario):
            return jsonify({'message': "No es el admin del proyecto"}), 400
        
        #Tambien se realizaran verificaciones de que los integrantes y el admin del nuevo grupo pertenezcan al proyecto.
        idAdminGrupo = data['idAdminGrupo']
        query = """"""
        result = db.execute_query(query, (idAdminGrupo,))
        print(result)
        if (result[0][0] == False):
            return jsonify({'message': 'Este usuario no pertenece al proyecto'}), 400
        
        integrantes = data['integrantes']
        for integrante in integrantes:
            query = """"""
            result = db.execute_query(query, (integrante, ))
            if(result[0] == False):
                print(f"El usuario {integrante} no pertenece al proyecto")
                return jsonify({'message': 'Este usuario no pertenece al proyecto'}), 400
        
        #Se terminan de pedir los demas datos
        fechaInicio = data['fechaInicio']
        fechaFin = data['fechaFin']
        #Verificar formato de que el formato de las fechas sea valido.
        titulo = data['titulo']
        descripcion = data['descripcion']
        tareaGrupal = TareaGrupal()
        tareaGrupal.crearTareaGrupal(titulo, descripcion, idProyecto, idAdminGrupo, fechaInicio, fechaFin, integrantes, db) 
        
        return jsonify({'message': "OK"}), 200
        
        

db = MySQLConnector('APIRestV1-TeamTasker\config.json')
db.connect()

if __name__ == '__main__':
    app.run(port=3000,debug=True)
    
