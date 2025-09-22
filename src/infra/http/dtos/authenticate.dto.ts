import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString } from 'class-validator'

export class AuthenticateDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  password: string
}

export class AuthenticateResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token!: string
}
