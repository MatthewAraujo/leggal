import { ApiProperty } from '@nestjs/swagger'

export class SemanticSearchDto {
	@ApiProperty({
		description: 'Título da task para análise semântica',
		example: 'Implementar autenticação JWT',
	})
	title!: string

	@ApiProperty({
		description: 'Descrição detalhada da task',
		example: 'Criar o endpoint de login e proteger rotas usando JWT no NestJS',
	})
	description!: string
}
