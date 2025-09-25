import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class SuggestPriorityDto {
	@ApiProperty({ description: 'Título da tarefa', example: 'Estudar NestJS' })
	@IsString()
	title!: string

	@ApiProperty({
		description: 'Descrição da tarefa',
		example: 'Ler documentação e fazer exercícios',
	})
	@IsString()
	description!: string
}

export class SuggestPriorityResponseDto {
	@ApiProperty({
		description: 'Prioridade sugerida',
		example: 'HIGH',
		enum: ['LOW', 'MEDIUM', 'HIGH'],
	})
	priority!: 'LOW' | 'MEDIUM' | 'HIGH'
}
