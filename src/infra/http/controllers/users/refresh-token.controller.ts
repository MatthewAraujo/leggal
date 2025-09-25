import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { InvalidRefreshTokenError } from '@/domain/todo/application/use-cases/errors/invalid-refresh-token-error'
import { RefreshTokenUseCase } from '@/domain/todo/application/use-cases/user/auth/refresh-token'
import { Public } from '@/infra/auth/public'
import { RefreshTokenDto, RefreshTokenResponseDto } from '@/infra/http/dtos/refresh-token.dto'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
	BadRequestException,
	Body,
	Controller,
	HttpCode,
	Post,
	UnauthorizedException,
	UsePipes,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'

const refreshTokenBodySchema = z.object({
	refresh_token: z.string(),
})

type RefreshTokenBodySchema = z.infer<typeof refreshTokenBodySchema>

@ApiTags('auth')
@Controller('/sessions')
@Public()
export class RefreshTokenController {
	constructor(private refreshTokenUseCase: RefreshTokenUseCase) {}

	@Post('/refresh')
	@HttpCode(200)
	@ApiOperation({ summary: 'Renovar access token usando refresh token' })
	@ApiBody({ type: RefreshTokenDto })
	@ApiResponse({
		status: 200,
		description: 'Token renovado com sucesso',
		type: RefreshTokenResponseDto,
	})
	@ApiResponse({ status: 401, description: 'Refresh token inválido' })
	@ApiResponse({ status: 400, description: 'Dados inválidos' })
	@UsePipes(new ZodValidationPipe(refreshTokenBodySchema))
	async handle(@Body() body: RefreshTokenBodySchema) {
		const { refresh_token } = body

		const result = await this.refreshTokenUseCase.execute({
			refreshToken: refresh_token,
		})

		if (result.isLeft()) {
			const error = result.value

			switch (error.constructor) {
				case InvalidRefreshTokenError:
					throw new UnauthorizedException(error.message)
				case ResourceNotFoundError:
					throw new UnauthorizedException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		const { accessToken, refreshToken } = result.value

		return {
			access_token: accessToken,
			refresh_token: refreshToken,
		}
	}
}
