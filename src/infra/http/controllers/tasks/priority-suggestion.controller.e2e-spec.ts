import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { OpenAiService } from '@/infra/services/openai/openai.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Suggest priority (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let jwt: JwtService

  beforeAll(async () => {
    const openAiMock = {
      createCompletion: vi
        .fn()
        .mockResolvedValue(JSON.stringify({ priority: 'HIGH', reason: 'Urgent and impactful' })),
      createEmbedding: vi.fn(),
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    })
      .overrideProvider(OpenAiService)
      .useValue(openAiMock)
      .compile()

    app = moduleRef.createNestApplication()

    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

    await app.init()
  })

  test('[POST] /tasks/suggest-priority returns 200 with mocked priority', async () => {
    const user = await userFactory.makePrismaUser()
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post('/tasks/suggest-priority')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Fix prod incident', description: 'Service down' })

    expect(response.statusCode).toBe(201)

    expect(response.body).toEqual({
      priority: 'HIGH',
      reason: 'Urgent and impactful',
    })
  })
})
