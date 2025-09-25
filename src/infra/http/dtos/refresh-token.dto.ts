import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class RefreshTokenDto {
	@ApiProperty({
		description: 'Refresh token para obter novo access token',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	@IsString()
	refresh_token!: string
}

export class RefreshTokenResponseDto {
	@ApiProperty({
		description: 'Novo token de acesso JWT',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	access_token!: string

	@ApiProperty({
		description: 'Novo refresh token',
		example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
	})
	refresh_token!: string
}
