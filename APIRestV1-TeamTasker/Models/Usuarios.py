class Usuario:
    def __init__(self):
        self.idUser = None
        self.nombre = None
        self.apellido = None
        self.email = None
        self.contraseña = None
        self.perfil = None
        self.idTarea = None

    
class Administrador_Grupo(Usuario):
    def __init__(self):
        super().__init__()
            
class Administrador_Proyecto(Usuario):
    def __init__(self):
        super().__init__()