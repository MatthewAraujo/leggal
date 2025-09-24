import { TaskPriority, TaskStatus } from '@/domain/todo/enterprise/entities/task'
import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsEnum } from 'class-validator'



export class CreateTaskDto {
  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Estudar NestJS',
  })
  @IsString()
  title!: string

  @ApiProperty({
    description: 'Descrição detalhada da tarefa',
    example: 'Ler a documentação oficial do NestJS e praticar com um projeto simples',
  })
  @IsString()
  description!: string

  @ApiProperty({
    description: 'Prioridade da tarefa',
    example: 'HIGH',
    enum: TaskPriority,
  })
  @IsEnum(TaskPriority)
  priority!: TaskPriority

  @ApiProperty({
    description: 'Status da tarefa',
    example: 'PENDING',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  status!: TaskStatus
}

