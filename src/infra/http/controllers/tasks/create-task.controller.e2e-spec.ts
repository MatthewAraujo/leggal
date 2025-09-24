
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Create task (E2E)', () => {
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

  test('[POST] /tasks', async () => {
    const user = await userFactory.makePrismaUser()

    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'My first task',
        description: 'Finish the NestJS controller test',
        priority: 'HIGH',
        status: 'PENDING',
      })

    expect(response.statusCode).toBe(201)

    const taskOnDatabase = await prisma.task.findFirst({
      where: {
        title: 'My first task',
      },
    })

    expect(taskOnDatabase).toBeTruthy()
    expect(taskOnDatabase?.description).toBe('Finish the NestJS controller test')
    expect(taskOnDatabase?.priority).toBe('HIGH')
    expect(taskOnDatabase?.status).toBe('PENDING')
    expect(taskOnDatabase?.authorId).toBe(user.id.toString())
  })
})
