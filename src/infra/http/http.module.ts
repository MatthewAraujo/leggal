import { CreateTaskUseCase } from '@/domain/todo/application/use-cases/task/create/create-task'
import { DeleteTaskUseCase } from '@/domain/todo/application/use-cases/task/delete/delete-task'
import { EditTaskUseCase } from '@/domain/todo/application/use-cases/task/edit/edit-task'
import { FetchTasksUseCase } from '@/domain/todo/application/use-cases/task/get/get-tasks'
import { GenerateTaskUseCase } from '@/domain/todo/application/use-cases/task/ia/generate'
import { SemanticSearchEmbeddingUseCase } from '@/domain/todo/application/use-cases/task/ia/semantic-search'
import { SuggestPriorityUseCase } from '@/domain/todo/application/use-cases/task/ia/suggest-priority'
import { AuthenticateUserUseCase } from '@/domain/todo/application/use-cases/user/auth/authenticate-user'
import { RefreshTokenUseCase } from '@/domain/todo/application/use-cases/user/auth/refresh-token'
import { RegisterUserUseCase } from '@/domain/todo/application/use-cases/user/register/user-student'
import { Module } from '@nestjs/common'
import { CacheModule } from '../cache/cache.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { DatabaseModule } from '../database/database.module'
import { LogModule } from '../services/log/log.module'
import { ServicesModule } from '../services/services.module'
import { HealthController } from './controllers/health/health.controller'
import { LogsController } from './controllers/logs/logs.controller'
import { CreateTaskController } from './controllers/tasks/create-task.controller'
import { DeleteTaskController } from './controllers/tasks/delete-task.controller'
import { EditTaskController } from './controllers/tasks/edit-task.controller'
import { FetchTasksController } from './controllers/tasks/fetch-task.controller'
import { GenerateTaskController } from './controllers/tasks/generate-task.controller'
import { SuggestPriorityController } from './controllers/tasks/priority-suggestion.controller'
import { SemanticSearchController } from './controllers/tasks/semantic-search.controller'
import { AuthenticateController } from './controllers/users/authenticate.controller'
import { CreateAccountController } from './controllers/users/create-account.controller'
import { RefreshTokenController } from './controllers/users/refresh-token.controller'

@Module({
	imports: [DatabaseModule, CryptographyModule, CacheModule, ServicesModule],
	controllers: [
		CreateAccountController,
		AuthenticateController,
		RefreshTokenController,
		LogsController,
		HealthController,
		CreateTaskController,
		EditTaskController,
		FetchTasksController,
		DeleteTaskController,
		GenerateTaskController,
		SuggestPriorityController,
		SemanticSearchController,
	],
	providers: [
		AuthenticateUserUseCase,
		RegisterUserUseCase,
		RefreshTokenUseCase,
		CreateTaskUseCase,
		EditTaskUseCase,
		FetchTasksUseCase,
		DeleteTaskUseCase,
		GenerateTaskUseCase,
		SuggestPriorityUseCase,
		SemanticSearchEmbeddingUseCase,
	],
})
export class HttpModule {}
