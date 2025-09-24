import { Module } from '@nestjs/common'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { CacheModule } from '../cache/cache.module'
import { LogModule } from '../services/log/log.module'
import { AuthenticateController } from './controllers/users/authenticate.controller'
import { CreateAccountController } from './controllers/users/create-account.controller'
import { RefreshTokenController } from './controllers/users/refresh-token.controller'
import { LogsController } from './controllers/logs/logs.controller'
import { HealthController } from './controllers/health/health.controller'
import { RegisterUserUseCase } from '@/domain/todo/application/use-cases/user/register/user-student'
import { RefreshTokenUseCase } from '@/domain/todo/application/use-cases/user/auth/refresh-token'
import { AuthenticateUserUseCase } from '@/domain/todo/application/use-cases/user/auth/authenticate-user'
import { CreateTaskController } from './controllers/tasks/create-task.controller'
import { FetchTasksController } from './controllers/tasks/fetch-task.controller'
import { EditTaskController } from './controllers/tasks/edit-task.controller'
import { DeleteTaskController } from './controllers/tasks/delete-task.controller'
import { CreateTaskUseCase } from '@/domain/todo/application/use-cases/task/create/create-task'
import { EditTaskUseCase } from '@/domain/todo/application/use-cases/task/edit/edit-task'
import { DeleteTaskUseCase } from '@/domain/todo/application/use-cases/task/delete/delete-task'
import { FetchTasksUseCase } from '@/domain/todo/application/use-cases/task/get/get-tasks'

@Module({
  imports: [DatabaseModule, CryptographyModule, CacheModule, LogModule],
  controllers: [
    CreateAccountController,
    AuthenticateController,
    RefreshTokenController,
    LogsController,
    HealthController,
    CreateTaskController,
    EditTaskController,
    FetchTasksController,
    DeleteTaskController
  ],
  providers: [
    AuthenticateUserUseCase,
    RegisterUserUseCase,
    RefreshTokenUseCase,
    CreateTaskUseCase,
    EditTaskUseCase,
    FetchTasksUseCase,
    DeleteTaskUseCase
  ],
})
export class HttpModule { }
