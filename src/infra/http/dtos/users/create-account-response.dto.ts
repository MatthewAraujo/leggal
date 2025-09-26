import { ApiProperty } from '@nestjs/swagger'

export class CreateAccountResponseDto {
  @ApiProperty({
    description: 'Mensagem de sucesso',
    example: 'Usuário criado com sucesso',
  })
  message!: string

  @ApiProperty({
    description: 'ID do usuário criado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId!: string
}
