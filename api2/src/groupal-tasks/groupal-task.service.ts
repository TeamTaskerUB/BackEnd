import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GroupalTask } from './schemas/groupal-task.schema';
import { GlobalTask } from '../global-task/schemas/global-task.schema';
import { CreateGroupalTaskDto } from './dtos/create-gruopal-task.dto';
import { Task } from 'src/tasks/schemas/task.schema';
import { GlobalTasksService } from 'src/global-task/global-task.service';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class GroupalTasksService {
  constructor(
    @InjectModel(GroupalTask.name) private readonly groupalTaskModel: Model<GroupalTask>,
    @InjectModel(GlobalTask.name) private readonly globalTaskModel: Model<GlobalTask>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    
    private readonly globalTasksService: GlobalTasksService
  ) {}

  async createGroupalTask(globalTaskId: string, createGroupalTaskDto: CreateGroupalTaskDto, userId:string): Promise<GroupalTask> {
    const groupalTask = new this.groupalTaskModel({
      ...createGroupalTaskDto,
      status: false,
    });




    const createdGroupalTask = await groupalTask.save();

    const globalTask = await this.globalTaskModel.findById(globalTaskId);
    if (!globalTask) {
      throw new NotFoundException(`Global Task with ID "${globalTaskId}" not found`);
    }

    globalTask.groupalTasks.push(createdGroupalTask._id);
    await globalTask.save();

    return createdGroupalTask;
  }

  async getGroupalTaskPreview(userId: string, groupalTaskId: string) {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId).lean();
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }
  
    // Obtener detalles del administrador del equipo grupal
    const admin = groupalTask.admin
      ? await this.userModel.findById(groupalTask.admin).select('name email').lean()
      : null;
  
    // Obtener detalles de los miembros del equipo grupal
    const members = await this.userModel
      .find({ _id: { $in: groupalTask.members } })
      .select('name email')
      .lean();
  
    // Obtener las tareas asociadas (nombres y estados)
    const tasks = await this.taskModel
      .find({ _id: { $in: groupalTask.tasks } })
      .select('name status')
      .lean();
  
    // Calcular el progreso de las tareas grupales
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status).length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
    // Generar la respuesta
    return {
      ...groupalTask,
      createdBy: admin ? admin.name : null,
      adminEmail: admin ? admin.email : null,
      members: {
        count: members.length,
        list: members, // Lista de miembros con `name` y `email`
      },
      tasks: {
        count: tasks.length,
        list: tasks, // Lista de tareas con `name` y `status`
      },
      progress: progress.toFixed(2), // Porcentaje de progreso
    };
  }
  
  
  
  async assignAdmin(groupalTaskId: string, newAdminId: string): Promise<GroupalTask> {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    groupalTask.admin = new Types.ObjectId(newAdminId);
    await groupalTask.save();
    return groupalTask;
  }


  async deleteGroupalTask(groupalTaskId: string): Promise<void> {
    // Convertir el ID de la GroupalTask a ObjectId
    const groupalTaskObjectId = new Types.ObjectId(groupalTaskId);
  
    // Buscar la GroupalTask
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskObjectId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }
  
    // Buscar la GlobalTask asociada
    const globalTask = await this.globalTaskModel.findOne({ groupalTasks: groupalTaskObjectId });
    if (!globalTask) {
      throw new NotFoundException(`Global Task associated with Groupal Task "${groupalTaskId}" not found`);
    }
  
    // Eliminar todas las tareas individuales asociadas a la GroupalTask
    for (const taskId of groupalTask.tasks) {
      await this.taskModel.deleteOne({ _id: taskId });
  
      // Eliminar el ID de la tarea individual de la GlobalTask
      globalTask.tasks = globalTask.tasks.filter(
        (globalTaskTaskId) => globalTaskTaskId.toString() !== taskId.toString(),
      );
    }
  
    // Eliminar el ID de la GroupalTask de la GlobalTask
    globalTask.groupalTasks = globalTask.groupalTasks.filter(
      (gTaskId) => gTaskId.toString() !== groupalTaskObjectId.toString(),
    );
  
    // Guardar los cambios en la GlobalTask
    await globalTask.save();
  
    // Eliminar la GroupalTask
    await this.groupalTaskModel.deleteOne({ _id: groupalTaskObjectId });
  }
  
  
  

  async removeAdminFromGroupalTask(groupalTaskId: string): Promise<GroupalTask> {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }

    groupalTask.admin = null;
    await groupalTask.save();
    return groupalTask;
  }

  async addMemberToGroupalTask(groupalTaskId: string, userId: string): Promise<GroupalTask> {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }
  
    const userObjectId = new Types.ObjectId(userId); // Convertir userId a ObjectId
  
    // Verificar si el usuario ya es miembro antes de agregar
    if (!groupalTask.members.includes(userObjectId)) {
      groupalTask.members.push(userObjectId); // Agregar como ObjectId
      await groupalTask.save();
    }
  
    return groupalTask;
  }
  
  async removeMemberFromGroupalTask(groupalTaskId: string, userId: string, requesterId: string): Promise<GroupalTask> {
    const groupalTask = await this.groupalTaskModel.findById(groupalTaskId);
    if (!groupalTask) {
      throw new NotFoundException(`Groupal Task with ID "${groupalTaskId}" not found`);
    }
  
    // Verificar si el requester es el admin
    if (groupalTask.admin.toString() !== requesterId) {
      throw new ForbiddenException('Only the admin can remove members from this groupal task.');
    }
  
    const userObjectId = new Types.ObjectId(userId); // Convertir userId a ObjectId
  
    // Verificar si el usuario está en la lista de miembros
    if (groupalTask.members.includes(userObjectId)) {
      groupalTask.members = groupalTask.members.filter(
        (memberId) => memberId.toString() !== userObjectId.toString(),
      ); // Filtrar al usuario
      await groupalTask.save();
    } else {
      throw new NotFoundException('User is not a member of this groupal task.');
    }
  
    return groupalTask;
  }
  
}
