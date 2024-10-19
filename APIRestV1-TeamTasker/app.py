from datetime import datetime
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
        nombre = data['nombre']
        descripcion = data['descripcion']
        # Verificacion general con los datos mas importantes no esten vacios.
        if not idUsuario or not idAdminGrupo or not (fechaFin and fechaInicio) or not nombre:
            return jsonify({'message': 'Faltan campos obligatorios'}), 400
        if not descripcion:
            descripcion = ""

        #Verificar que el adminProyecto es el que usa este metodo.
        check = verificarAdminProyecto(db, idUsuario, idTareaGlobal)
        if not check == "OK":
            return check, 401
        
        #Verificar que no exista una tareaGrupal con el mismo nombre en el mismo proyecto.
        check = existeTareaGrupal(db, idTareaGlobal, nombre)
        if not  check == "OK":
            return check, 401
        
        #Tambien se realizaran verificaciones de que los integrantes y el admin del nuevo grupo pertenezcan al proyecto.
        integrantes = data['integrantes']
        if not integrantes:
            integrantes = []
        
        check = verificarIntegrantes(db, integrantes, idTareaGlobal, idAdminGrupo, idUsuario)    
        if not check == "OK":
            return check, 401
        
        #Verificar formato de que el formato de las fechas sea valido. Y pasar el string a un int
        check, fechaInicio, fechaFin = verificarFechas(fechaInicio, fechaFin)
        if not check == "OK":
            return check, fechaInicio
        
        # Instanciar la tarea grupal y pasarle los parametros que se enviaron y comprobaron.
        tareaGrupal = TareaGrupal()
        result = tareaGrupal.crearTareaGrupal(nombre, descripcion, idTareaGlobal, idAdminGrupo, fechaInicio, fechaFin, integrantes, db) 
        if (result == "OK"):
            return jsonify({'message': "OK"}), 200
        else:
            return jsonify({"message": "Error al crear tarea grupal"}), 401
        
    return jsonify({'message': 'Metodo no valido'}), 405

#Endpoint con el cual se podra eliminar una tarea grupal.
@app.route('/<int:idTareaGlobal>/eliminar_tarea_grupal', methods=['DELETE'])
def eliminarTareaGrupal(idTareaGlobal):
    if request.method == 'DELETE':
        data = request.json
        idUsuario = data['idUsuario']
        idTareaGrupal = data['idTareaGrupal']
        if not (idUsuario and idTareaGrupal):
            return jsonify({'message': 'Faltan campos obligatorios'}), 400
        check = verificarAdminProyecto(db, idUsuario, idTareaGlobal)
        if not check == "OK":
            return check
        tareaGrupal = TareaGrupal()
        tareaGrupal.asignarTareaGrupal(db)
        return
    return jsonify({'message': 'Metodo no valido'}), 405

#Funcion para verificar que el id pertenece al del admin del proyecto
def verificarAdminProyecto(db: MySQLConnector, id: int, idTareaGlobal: int):
    query = """SELECT admin_id FROM tareaglobal WHERE idProyecto = %s"""
    result = db.fetch_data(query, (idTareaGlobal,))
    if not (result[0][0] == id):
        return jsonify({'message': "No es el admin del proyecto"})
    else:
        return "OK"
    
#Funcion para verificar que todos los integrantes pertenezcan al proyecto.
def verificarIntegrantes(db: MySQLConnector, integrantes, idTareaGlobal: int, idAdminGrupo, idAdminProyecto):
    result = db.execute_stored_procedure("get_usuarios_proyecto", (idTareaGlobal,))
    if not result == None:
        for usuario in result:
            if len(usuario) >= 1 and len(usuario[0]) >= 1:
                if not (usuario[0][0] in integrantes or usuario[0][0] == idAdminGrupo or usuario[0][0] == idAdminProyecto):
                    return jsonify({'message': f"El integrante {usuario[0]} no pertenece al proyecto"})
    return "OK"

#Funcion para verificar que las fechas esten en el formato necesario.
def verificarFechas(fechaInicio, fechaFin):
    #Primero se dividen los strings en listas a base del separador
    fechaInicio = fechaInicio.split("/")
    fechaFin = fechaFin.split("/")
    if not (len(fechaInicio) == 3 and len(fechaFin) == 3):
        return jsonify({'message': 'Error en la sintaxis'}), 400, 400
    #Se convierte cada string en un numero
    for fecha in fechaInicio:
        try:
            fecha = int(fecha)
        except Exception as e:
            return jsonify({'message': f"Parametro invalido para la fecha de Inicio: {e}"}), 400, 400
    for fecha in fechaFin:
        try:
            fecha = int(fecha)
        except Exception as e:
            return jsonify({'message': f"Parametro invalido para la fecha de Fin: {e}"}), 400, 400
    try:
        #Para finalizar se pasan al formato indicado.
        fechaInicio = datetime(int(fechaInicio[0]), int(fechaInicio[1]), int(fechaInicio[2]))
        fechaFin = datetime(int(fechaFin[0]), int(fechaFin[1]), int(fechaFin[2]))
    except Exception as e:
        return jsonify({'message': 'Problema con la sintaxis'}), 400, 400
    return "OK", fechaInicio, fechaFin

#Verificar que exista una tarea grupal con el mismo nombre
def existeTareaGrupal(db: MySQLConnector, idTareaGlobal: int, nombre):
    query = """SELECT nombre FROM tareagrupal WHERE idProyecto = %s"""
    result = db.fetch_data(query, (idTareaGlobal,))
    try:
        for resultado in result:
            if resultado[0] == nombre:
                return "Error: Ya existe una tarea grupal con ese nombre."
    except:
        return "OK"
    return "OK"

db = MySQLConnector('APIRestV1-TeamTasker\config.json')
db.connect()   
if __name__ == '__main__':
    app.run(port=3000,debug=True)
    
