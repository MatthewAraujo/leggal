import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { INestApplication } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test } from '@nestjs/testing'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'
import { OpenAiService } from '@/infra/services/openai/openai.service'

describe('Semantic search (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService
  let userFactory: UserFactory
  let jwt: JwtService

  beforeAll(async () => {
    const openAiMock = {
      createCompletion: vi.fn(),
      createEmbedding: vi.fn().mockResolvedValue([0.1, 0.2, 0.3]),
    }

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    })
      .overrideProvider(OpenAiService)
      .useValue(openAiMock)
      .compile()

    app = moduleRef.createNestApplication()

    prisma = moduleRef.get(PrismaService)
    userFactory = moduleRef.get(UserFactory)
    jwt = moduleRef.get(JwtService)

      // Stub the vector similarity query to avoid requiring pgvector locally
      // We return a deterministic list of tasks as if they were similar
      ; (prisma.$queryRaw as any) = vi.fn().mockResolvedValue([
        {
          id: 't1',
          title: 'Similar Task 1',
          slug: 'similar-task-1',
          description: 'First similar',
          priority: 'LOW',
          status: 'PENDING',
          authorId: 'author-1',
        },
        {
          id: 't2',
          title: 'Similar Task 2',
          slug: 'similar-task-2',
          description: 'Second similar',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          authorId: 'author-2',
        },
      ])

    await app.init()
  })

  test('[POST] /tasks/semantic-search returns 200 and tasks array', async () => {
    const user = await userFactory.makePrismaUser()
    const accessToken = jwt.sign({ sub: user.id.toString() })

    const response = await request(app.getHttpServer())
      .post('/tasks/semantic-search')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ title: 'Search', description: 'Find similar tasks' })

    expect(response.statusCode).toBe(200)
    expect(Array.isArray(response.body.tasks)).toBe(true)
    expect(response.body.tasks.length).toBeGreaterThan(0)
    expect(response.body.tasks[0]).toEqual(
      expect.objectContaining({ title: 'Similar Task 1' }),
    )
  })
})


