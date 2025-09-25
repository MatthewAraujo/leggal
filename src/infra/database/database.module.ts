import { TasksRepository } from '@/domain/todo/application/repositories/task-repository'
import { UsersRepository } from '@/domain/todo/application/repositories/users-repository'
import { Module } from '@nestjs/common'
import { CacheModule } from '../cache/cache.module'
import { PrismaService } from './prisma/prisma.service'
import { PrismaTasksRepository } from './prisma/repositories/prisma-tasks-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-user-repository'
@Module({
	imports: [CacheModule],
	providers: [
		PrismaService,
		{
			provide: UsersRepository,
			useClass: PrismaUsersRepository,
		},
		{
			provide: TasksRepository,
			useClass: PrismaTasksRepository,
		},
	],
	exports: [PrismaService, UsersRepository, TasksRepository],
})
export class DatabaseModule {}
