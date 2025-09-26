import { ApiProperty } from '@nestjs/swagger'

export class SemanticSearchDto {
  @ApiProperty({
    description: 'Descrição detalhada da task',
    example: 'Criar o endpoint de login e proteger rotas usando JWT no NestJS',
  })
  description!: string
}
