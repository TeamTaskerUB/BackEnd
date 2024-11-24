import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GlobalTask } from './schemas/global-task.schema';
import { GroupalTask } from '../groupal-tasks/schemas/groupal-task.schema';
import { Task } from '../tasks/schemas/task.schema';
import { CreateGlobalTaskDto } from './dtos/create-global-task.dto';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class GlobalTasksService {
  constructor(
    @InjectModel(GlobalTask.name) private readonly globalTaskModel: Model<GlobalTask>,
    @InjectModel(GroupalTask.name) private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(User.name) protected readonly userModel: Model<User>,
    private readonly userService: UserService
  ) {}

  async getUserRoleInGlobalTask(globalTaskId: string, userId: string): Promise<string> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId).exec();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
  
    // Verificar si el usuario es administrador de la tarea global
    if (globalTask.admin.toString() === userId) {
      return 'PManager';
    }
  
    // Verificar si el usuario es administrador de alguna tarea grupal adyacente
    for (const groupalTaskId of globalTask.groupalTasks) {
      const groupalTask = await this.groupalTaskModel.findById(groupalTaskId).exec();
      if (groupalTask && groupalTask.admin && groupalTask.admin.toString() === userId) {
        return 'GManager';
      }
    }



  
    
  
  
    // Verificar si el usuario está asignado en alguna tarea individual
    const tasks = await this.taskModel.find({ _id: { $in: globalTask.tasks } }).exec();
    for (const task of tasks) {
      if (task.assignees.some(assigneeId => assigneeId.toString() === userId)) {
        return 'User';
      }
    }
  
    // Si no es admin ni asignado en ninguna tarea, devolvemos 'noUser' o algún valor indicativo
    return 'noUser';
  }


  async getGroupalTasksByGlobalTaskId(userId: string, globalTaskId: string) {
    // Verificar el rol del usuario
    const userRole = await this.getUserRoleInGlobalTask(globalTaskId, userId);
    if (userRole === 'noUser') {
      throw new ForbiddenException('No puedes acceder no siendo parte del proyecto');
    }
  
    // Buscar la tarea global
    const globalTask = await this.globalTaskModel.findById(globalTaskId).lean();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
  
    // Buscar las tareas grupales asociadas
    const groupalTasks = await this.groupalTaskModel
      .find({ _id: { $in: globalTask.groupalTasks } })
      .select('_id name')
      .lean();
  
    // Devolver el JSON directamente
    return groupalTasks.map((task) => ({
      id: task._id,
      name: task.name,
    }));
  }
  
  

  async getGlobalTaskById(globalTaskId: string): Promise<GlobalTask> {
    const globalTask = await this.globalTaskModel.findById(globalTaskId).exec();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
    return globalTask;
  }

  
  async getGlobalTaskPreview(userId: string, globalTaskId: string) {
    const userRole = await this.getUserRoleInGlobalTask(globalTaskId, userId);
  
    if (userRole === 'noUser') {
      throw new ForbiddenException('No puedes acceder no siendo parte del proyecto');
    }
  
    const globalTask = await this.globalTaskModel.findById(globalTaskId).lean();
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
  
    // Obtener el administrador del proyecto
    const admin = await this.userModel.findById(globalTask.admin).select('name').lean();
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }
  
    // Obtener los miembros del proyecto (nombre y correo)
    const members = await this.userModel
      .find({ _id: { $in: globalTask.members } })
      .select('name email')
      .lean();
  
    // Calcular el porcentaje de avance del proyecto
    const totalTasks = globalTask.tasks.length;
    const completedTasks = await this.taskModel.countDocuments({
      _id: { $in: globalTask.tasks },
      status: true,
    });
  
    const totalGroupalTasks = globalTask.groupalTasks.length;
    const completedGroupalTasks = await this.groupalTaskModel.countDocuments({
      _id: { $in: globalTask.groupalTasks },
      status: true,
    });
  
    const totalItems = totalTasks + totalGroupalTasks;
    const completedItems = completedTasks + completedGroupalTasks;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
  
    // Mapear el rol del usuario que hace la solicitud
    const roleMapping = {
      PManager: 'ProjectAdmin',
      GManager: 'GroupAdmin',
      User: 'User',
    };
    const role = roleMapping[userRole] || 'User';
  
    return {
      ...globalTask,
      createdBy: admin.name,
      members: {
        count: members.length,
        list: members, // Lista con `name` y `email` de cada miembro
      },
      teams: globalTask.groupalTasks.length,
      progress: progress,
      role: role, // Rol de la persona que hace la solicitud
    };
  }
  

  async createGlobalTask(createGlobalTaskDto: CreateGlobalTaskDto, userId: string): Promise<GlobalTask> {
    const globalTask = new this.globalTaskModel({
      ...createGlobalTaskDto,
      admin: userId,
      grupalTasks: [],
      tasks: [],
      status: false,
    });

    const createdGlobalTask = await globalTask.save();

    // Agregar el ID de la tarea global al usuario que la creó
    await this.userModel.findByIdAndUpdate(
      userId,
      { $push: { tasks: createdGlobalTask._id } }, // Agregar el ID de la tarea al array tasks del usuario
      { new: true } // Opcional: Devuelve el usuario actualizado
    );

    return createdGlobalTask;
  }

  async deleteGlobalTask(globalTaskId: string, userId: string): Promise<void> {
    const userRole = await this.getUserRoleInGlobalTask(globalTaskId, userId);
    console.log(userRole);
    if (userRole !== 'PManager') {
      throw new ForbiddenException('No puedes acceder no siendo parte del proyecto');
    }
  
    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }
  
    // Eliminar todas las tareas grupales e individuales asociadas a la tarea global
    for (const groupalTaskId of globalTask.groupalTasks) {
      const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
      if (groupalTask) {
        for (const taskId of groupalTask.tasks) {
          await this.taskModel.deleteOne({ _id: taskId });
        }
        await this.groupalTaskModel.deleteOne({ _id: groupalTaskId });
      }
    }
  
    // Eliminar la tarea global
    await this.globalTaskModel.deleteOne({ _id: globalTaskId });
  
    // Eliminar el ID de la tarea global del array de tareas del usuario
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { tasks: globalTaskId } }, // Elimina el ID de la tarea del array `tasks`
      { new: true }
    );
  }

  async getUserGlobalTasks(userId: string): Promise<GlobalTask[]> {
    // Obtener el usuario y sus IDs de tareas
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }
  
    // Buscar todas las Global Tasks usando los IDs obtenidos del usuario
    return this.globalTaskModel.find({ _id: { $in: user.tasks } }).exec();
  }
  
async addMemberToGlobalTask(globalTaskId: string, userId: string, requesterId: string): Promise<GlobalTask> {
  const globalTask = await this.globalTaskModel.findById(globalTaskId);
  if (!globalTask) {
    throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
  }

  if (globalTask.admin.toString() !== requesterId) {
    throw new ForbiddenException('Only the admin can add members to this global task.');
  }

  const userObjectId = new Types.ObjectId(userId); // Convertir userId a ObjectId

  if (!globalTask.members.includes(userObjectId)) {
    globalTask.members.push(userObjectId); // Agregar como ObjectId
    await globalTask.save();
  }

  return globalTask;
}
  
async removeMemberFromGlobalTask(globalTaskId: string, userId: string, requesterId: string): Promise<GlobalTask> {
  const globalTask = await this.globalTaskModel.findById(globalTaskId);
  if (!globalTask) {
    throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
  }

  // Verificar si el requester es el admin
  if (globalTask.admin.toString() !== requesterId) {
    throw new ForbiddenException('Only the admin can remove members from this global task.');
  }

  const userObjectId = new Types.ObjectId(userId); // Convertir userId a ObjectId

  // Verificar si el usuario está en la lista de miembros
  if (globalTask.members.includes(userObjectId)) {
    globalTask.members = globalTask.members.filter(
      (memberId) => memberId.toString() !== userObjectId.toString(),
    ); // Filtrar al usuario
    await globalTask.save();
  } else {
    throw new NotFoundException('User is not a member of this global task.');
  }

  return globalTask;
}

}
