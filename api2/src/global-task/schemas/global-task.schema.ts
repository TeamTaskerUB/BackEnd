import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class GlobalTask extends Document {

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  priority: string;

  @Prop({
    type: [{ id: { type: Types.ObjectId, ref: 'User' }, text: { type: String } }],
    default: [],
  })
  comments: { id: Types.ObjectId; text: string }[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'GroupalTask' }], default: [] })
  groupalTasks: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Task' }], default: [] })
  tasks: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  admin: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] }) // Agregamos el campo members
  members: Types.ObjectId[];

  // Campo para manejar el estado (status) de la tarea
  @Prop({ type: Boolean, default: true })
  status: boolean;

  // Control de versiones __v
  @Prop({ type: Number, select: false })  // Mongoose lo maneja automáticamente, pero si quieres incluirlo:
  __v: number;
}

export const GlobalTaskSchema = SchemaFactory.createForClass(GlobalTask);
