import { UserAlreadyExistsError } from '@/domain/todo/application/use-cases/errors/user-already-exists-error'
import { RegisterUserUseCase } from '@/domain/todo/application/use-cases/user/register/user-student'
import { Public } from '@/infra/auth/public'
import { CreateAccountDto } from '@/infra/http/dtos/create-account.dto'
import { CreateAccountResponseDto } from '@/infra/http/dtos/users/create-account-response.dto'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import {
	BadRequestException,
	Body,
	ConflictException,
	Controller,
	HttpCode,
	Post,
	UsePipes,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { z } from 'zod'

const createAccountBodySchema = z.object({
	name: z.string(),
	email: z.string().email(),
	password: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@ApiTags('users')
@Controller('/accounts')
@Public()
export class CreateAccountController {
	constructor(private registerUser: RegisterUserUseCase) { }

	@Post()
	@HttpCode(201)
	@ApiOperation({ summary: 'Criar nova conta de usuário' })
	@ApiBody({ type: CreateAccountDto })
	@ApiResponse({ status: 201, description: 'Usuário criado com sucesso', type: CreateAccountResponseDto })
	@ApiResponse({ status: 409, description: 'Usuário já existe' })
	@ApiResponse({ status: 400, description: 'Dados inválidos' })
	@UsePipes(new ZodValidationPipe(createAccountBodySchema))
	async handle(@Body() body: CreateAccountBodySchema) {
		const { name, email, password } = body

		const result = await this.registerUser.execute({
			name,
			email,
			password,
		})

		if (result.isLeft()) {
			const error = result.value

			switch (error.constructor) {
				case UserAlreadyExistsError:
					throw new ConflictException(error.message)
				default:
					throw new BadRequestException(error.message)
			}
		}

		const user = result.value.user

		return {
			message: 'Usuário criado com sucesso',
			userId: user.id.toString(),
		}
	}
}
