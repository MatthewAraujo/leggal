import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Delete task (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let userFactory: UserFactory
	let jwt: JwtService

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule],
			providers: [UserFactory],
		}).compile()

		app = moduleRef.createNestApplication()

		prisma = moduleRef.get(PrismaService)
		userFactory = moduleRef.get(UserFactory)
		jwt = moduleRef.get(JwtService)

		await app.init()
	})

	test('[DELETE] /tasks/:id - successfully deletes task', async () => {
		const user = await userFactory.makePrismaUser()
		const accessToken = jwt.sign({ sub: user.id.toString() })

		const task = await prisma.task.create({
			data: {
				title: 'Task to delete',
				description: 'Task description',
				priority: 'HIGH',
				status: 'PENDING',
				authorId: user.id.toString(),
			},
		})

		const response = await request(app.getHttpServer())
			.delete(`/tasks/${task.id}`)
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(204)

		const deletedTask = await prisma.task.findUnique({ where: { id: task.id } })
		expect(deletedTask).toBeNull()
	})

	test('[DELETE] /tasks/:id - cannot delete task of another user', async () => {
		const user1 = await userFactory.makePrismaUser()
		const user2 = await userFactory.makePrismaUser()
		const accessToken = jwt.sign({ sub: user1.id.toString() })

		const task = await prisma.task.create({
			data: {
				title: 'Another user task',
				description: 'Task description',
				priority: 'MEDIUM',
				status: 'PENDING',
				authorId: user2.id.toString(),
			},
		})

		const response = await request(app.getHttpServer())
			.delete(`/tasks/${task.id}`)
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(401)
	})

	test('[DELETE] /tasks/:id - task not found', async () => {
		const user = await userFactory.makePrismaUser()
		const accessToken = jwt.sign({ sub: user.id.toString() })

		const response = await request(app.getHttpServer())
			.delete('/tasks/non-existing-id')
			.set('Authorization', `Bearer ${accessToken}`)

		expect(response.statusCode).toBe(409)
	})
})
