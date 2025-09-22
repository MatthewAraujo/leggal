import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, MinLength } from 'class-validator'

export class CreateAccountDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
  })
  @IsString()
  @MinLength(2)
  name!: string

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password!: string
}
