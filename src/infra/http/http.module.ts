import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { AuthenticateController } from './controllers/users/authenticate.controller'
import { CreateAccountController } from './controllers/users/create-account.controller'
import { AuthenticateUserUseCase } from '@/domain/todo/application/use-cases/user/auth/authenticate-student'
import { RegisterUserUseCase } from '@/domain/todo/application/use-cases/user/register/user-student'

@Module({
	imports: [DatabaseModule, CryptographyModule],
	controllers: [
		CreateAccountController,
		AuthenticateController,
	],
	providers: [
		AuthenticateUserUseCase,
		RegisterUserUseCase
	],
})
export class HttpModule { }
