import datetime
from flask import Flask, request, jsonify
from Models.MySQLConnector import MySQLConnector
from Models.Usuarios import *
from Models.Tareas import *

app = Flask(__name__)

# Endpoint para que el Administrador de Proyecto cree una tarea grupal, usando el id del proyecto en la ruta
@app.route('/<int:idTareaGlobal>/crear_tarea_grupal', methods=['POST'])
def crearTareaGrupal(idTareaGlobal):
    #Primero chequear que la solicitud sea un post
    if request.method == 'POST':
        data = request.json
        idUsuario = data['idUsuario']
        idAdminGrupo = data['idAdminGrupo']
        fechaInicio = data['fechaInicio']
        fechaFin = data['fechaFin']
        titulo = data['titulo']
        descripcion = data['descripcion']
        # Verificacion general con los datos absolutamente necesarios.
        if not idUsuario or not idAdminGrupo or not (fechaFin and fechaInicio) or not titulo:
            return jsonify({'message': 'Faltan campos obligatorios'}), 400
        if not descripcion:
            descripcion = ""
        # Se realizara una consulta para verificar que el usuario sea el admin de Proyecto.
        query = """SELECT admin_id FROM tareaglobal WHERE idProyecto = %s"""
        result = db.fetch_data(query, (idTareaGlobal,))
        if not (result[0][0] == idUsuario):
            return jsonify({'message': "No es el admin del proyecto"}), 401
        
        #Tambien se realizaran verificaciones de que los integrantes y el admin del nuevo grupo pertenezcan al proyecto.
        result = db.execute_stored_procedure("get_usuarios_proyecto", (idTareaGlobal,))
        integrantes = data['integrantes']
        for usuario in result:
            if not usuario[0] in integrantes or not usuario[0] == idAdminGrupo or not usuario[0] == idUsuario:
                return jsonify({'message': 'El integrante ' + usuario[1] + ' no pertenece al proyecto'}), 401
        
        #Verificar formato de que el formato de las fechas sea valido.
        fechaInicio = fechaInicio.split("/")
        fechaFin = fechaFin.split("/")
        if not len(fechaInicio) == 3 or not len(fechaFin) == 3:
            return jsonify({'message': 'Error en la sintaxis'}), 400
        fechaInicio = datetime(fechaInicio[0], fechaInicio[1], fechaInicio[2])
        fechaFin = datetime(fechaFin[0], fechaFin[1], fechaFin[2])
        
        # Instanciar la tarea grupal y pasarle los parametros que se enviaron y comprobaron.
        tareaGrupal = TareaGrupal()
        result = tareaGrupal.crearTareaGrupal(titulo, descripcion, idTareaGlobal, idAdminGrupo, fechaInicio, fechaFin, integrantes, db) 
        if (result == "OK"):
            return jsonify({'message': "OK"}), 200
        else:
            return jsonify({"message": "Error al crear tarea grupal"}), 401
    return jsonify({'message': 'Metodo no valido'}), 405

@app.route('/<int:idTareaGlobal>/eliminar_tarea_grupal', methods=['DELETE'])
def eliminarTareaGrupal(idTareaGlobal):
    if request.method == 'DELETE':
        data = request.json
        idUsuario = data['idUsuario']
        # Verificacion general con los datos absolutamente necesarios.
        if not idUsuario:
            return jsonify({'message': 'Faltan campos obligatorios'}), 400
        
        # Se realizara una consulta para verificar que el usuario sea el admin de Proyecto.
        query = """SELECT admin_id FROM tareaglobal WHERE idProyecto = %s"""
        result = db.fetch_data(query, (idTareaGlobal,))
        if not (result[0][0] == idUsuario):
            return jsonify({'message': "No es el admin del proyecto"}), 401
        
        return
    return jsonify({'message': 'Metodo no valido'}), 405
db = MySQLConnector('APIRestV1-TeamTasker\config.json')
db.connect()

if __name__ == '__main__':
    app.run(port=3000,debug=True)
    
