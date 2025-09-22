import { WrongCredentialsError } from '@/domain/todo/application/use-cases/errors/wrong-credentials-error'
import { AuthenticateUserUseCase } from '@/domain/todo/application/use-cases/user/auth/authenticate-student'
import { Public } from '@/infra/auth/public'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
	BadRequestException,
	Body,
	Controller,
	Post,
	UnauthorizedException,
	UsePipes,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { z } from 'zod'
import { AuthenticateDto, AuthenticateResponseDto } from '@/infra/http/dtos/authenticate.dto'

const authenticateBodySchema = z.object({
	email: z.string().email(),
	password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@ApiTags('auth')
@Controller('/sessions')
@Public()
export class AuthenticateController {
	constructor(private authenticateUser: AuthenticateUserUseCase) { }

	@Post()
	@ApiOperation({ summary: 'Autenticar usuário' })
	@ApiBody({ type: AuthenticateDto })
	@ApiResponse({
		status: 200,
		description: 'Usuário autenticado com sucesso',
		type: AuthenticateResponseDto,
	})
	@ApiResponse({ status: 401, description: 'Credenciais inválidas' })
	@ApiResponse({ status: 400, description: 'Dados inválidos' })
	@UsePipes(new ZodValidationPipe(authenticateBodySchema))
	async handle(@Body() body: AuthenticateBodySchema) {
		const { email, password } = body

		const result = await this.authenticateUser.execute({
			email,
			password,
		})

		if (result.isLeft()) {
			const error = result.value

			switch (error.constructor) {
				case WrongCredentialsError:
					throw new UnauthorizedException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		const { accessToken } = result.value

		return {
			access_token: accessToken,
		}
	}
}
