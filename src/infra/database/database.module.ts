import { Module } from '@nestjs/common'
import { CacheModule } from '../cache/cache.module'
import { PrismaService } from './prisma/prisma.service'
import { UsersRepository } from '@/domain/todo/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-user-repository'
@Module({
	imports: [CacheModule],
	providers: [
		PrismaService,
		{
			provide: UsersRepository,
			useClass: PrismaUsersRepository,
		},
	],
	exports: [
		PrismaService,
		UsersRepository
	],
})
export class DatabaseModule { }
