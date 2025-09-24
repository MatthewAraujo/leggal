import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { OpenAiService } from '@/infra/services/openai/openai.service'

describe('Generate task via IA (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory
  let jwt: JwtService

  beforeAll(async () => {
    const openAiMock = {
      createCompletion: vi.fn().mockResolvedValue(
        JSON.stringify({ title: 'AI title', description: 'AI description' }),
      ),
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

  test('[POST] /tasks/generate (IA generation) returns 201 without hitting OpenAI', async () => {
    const user = await userFactory.makePrismaUser()
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post('/tasks/generate')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ text: 'Please create a task from this text' })

    expect(response.statusCode).toBe(201)
  })
})


