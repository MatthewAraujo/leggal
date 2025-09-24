
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Edit task (E2E)', () => {
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

  test('[PUT] /tasks/:id - successfully edits task', async () => {
    const user = await userFactory.makePrismaUser()
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const task = await prisma.task.create({
      data: {
        title: 'Original Task',
        description: 'Original description',
        priority: 'MEDIUM',
        status: 'PENDING',
        authorId: user.id.toString(),
      },
    })

    const response = await request(app.getHttpServer())
      .put(`/tasks/${task.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Task',
        description: 'Updated description',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
      })

    expect(response.statusCode).toBe(204)

    const updatedTask = await prisma.task.findUnique({ where: { id: task.id } })
    expect(updatedTask).toBeTruthy()
    expect(updatedTask?.title).toBe('Updated Task')
    expect(updatedTask?.description).toBe('Updated description')
    expect(updatedTask?.priority).toBe('HIGH')
    expect(updatedTask?.status).toBe('IN_PROGRESS')
  })

  test('[PUT] /tasks/:id - cannot edit task of another user', async () => {
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
      .put(`/tasks/${task.id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'HIGH',
        status: 'COMPLETED',
      })

    expect(response.statusCode).toBe(401)
  })

  test('[PUT] /tasks/:id - task not found', async () => {
    const user = await userFactory.makePrismaUser()
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .put('/tasks/non-existing-id')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated Title',
        description: 'Updated description',
        priority: 'HIGH',
        status: 'COMPLETED',
      })

    expect(response.statusCode).toBe(404)
  })
})

