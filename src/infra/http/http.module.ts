import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { CacheModule } from '../cache/cache.module'
import { LogModule } from '../services/log/log.module'
import { AuthenticateController } from './controllers/users/authenticate.controller'
import { CreateAccountController } from './controllers/users/create-account.controller'
import { RefreshTokenController } from './controllers/users/refresh-token.controller'
import { LogsController } from './controllers/logs/logs.controller'
import { RegisterUserUseCase } from '@/domain/todo/application/use-cases/user/register/user-student'
import { RefreshTokenUseCase } from '@/domain/todo/application/use-cases/user/auth/refresh-token'
import { AuthenticateUserUseCase } from '@/domain/todo/application/use-cases/user/auth/authenticate-user'

@Module({
  imports: [DatabaseModule, CryptographyModule, CacheModule, LogModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    RefreshTokenController,
    LogsController,
  ],
  providers: [
    AuthenticateUserUseCase,
    RegisterUserUseCase,
    RefreshTokenUseCase,
  ],
})
export class HttpModule { }
