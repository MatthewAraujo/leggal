import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class DeleteTaskDto {
	@ApiProperty({
		description: 'ID da tarefa a ser deletada',
		example: '550e8400-e29b-41d4-a716-446655440000',
	})
	@IsString()
	@IsUUID()
	taskId!: string
}
