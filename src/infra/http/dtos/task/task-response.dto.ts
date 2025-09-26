import { ApiProperty } from '@nestjs/swagger'

export class TaskResponseDto {
  @ApiProperty({
    description: 'ID único da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string

  @ApiProperty({
    description: 'Título da tarefa',
    example: 'Estudar NestJS',
  })
  title!: string

  @ApiProperty({
    description: 'Descrição da tarefa',
    example: 'Ler documentação e fazer exercícios práticos',
  })
  description!: string

  @ApiProperty({
    description: 'Prioridade da tarefa',
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH'],
  })
  priority!: 'LOW' | 'MEDIUM' | 'HIGH'

  @ApiProperty({
    description: 'Status da tarefa',
    example: 'PENDING',
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
  })
  status!: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'

  @ApiProperty({
    description: 'Slug único da tarefa',
    example: 'estudar-nestjs',
  })
  slug!: string

  @ApiProperty({
    description: 'ID do autor da tarefa',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  authorId!: string

  @ApiProperty({
    description: 'Data de criação da tarefa',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date

  @ApiProperty({
    description: 'Data da última atualização da tarefa',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date
}

export class CreateTaskResponseDto {
  @ApiProperty({
    description: 'Tarefa criada',
    type: TaskResponseDto,
  })
  task!: TaskResponseDto
}

export class GetTasksResponseDto {
  @ApiProperty({
    description: 'Lista de tarefas',
    type: [TaskResponseDto],
  })
  tasks!: TaskResponseDto[]
}

export class GenerateTaskResponseDto {
  @ApiProperty({
    description: 'Tarefa gerada pela IA',
    type: TaskResponseDto,
  })
  task!: TaskResponseDto
}

export class SemanticSearchResponseDto {
  @ApiProperty({
    description: 'Lista de tarefas semanticamente similares',
    type: [TaskResponseDto],
  })
  tasks!: TaskResponseDto[]
}
