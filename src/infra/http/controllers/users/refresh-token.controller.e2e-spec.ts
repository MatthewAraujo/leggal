import { INestApplication } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/infra/app.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import request from 'supertest'
import { InMemoryCacheRepository } from 'test/repositories/in-memory-cache-repository'
import { CacheRepository } from '@/infra/cache/cache-repository'

describe('Refresh Token (E2E)', () => {
  let app: INestApplication
  let prisma: PrismaService

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: CacheRepository,
          useClass: InMemoryCacheRepository,
        },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    prisma = moduleRef.get(PrismaService)

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to refresh token', async () => {
    await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: '123456',
      })

    const authResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'johndoe@example.com',
        password: '123456',
      })

    const { refresh_token } = authResponse.body

    const response = await request(app.getHttpServer())
      .post('/sessions/refresh')
      .send({
        refresh_token,
      })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    })
    expect(response.body.access_token).not.toBe(authResponse.body.access_token)
    expect(response.body.refresh_token).not.toBe(refresh_token)
  })

  it('should not be able to refresh token with invalid refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/sessions/refresh')
      .send({
        refresh_token: 'invalid-refresh-token',
      })

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toBe('Refresh token is not valid.')
  })

  it('should not be able to refresh token twice with same refresh token', async () => {
    await request(app.getHttpServer())
      .post('/accounts')
      .send({
        name: 'Jane Doe',
        email: 'janedoe@example.com',
        password: '123456',
      })

    const authResponse = await request(app.getHttpServer())
      .post('/sessions')
      .send({
        email: 'janedoe@example.com',
        password: '123456',
      })

    const { refresh_token } = authResponse.body

    await request(app.getHttpServer())
      .post('/sessions/refresh')
      .send({
        refresh_token,
      })

    const response = await request(app.getHttpServer())
      .post('/sessions/refresh')
      .send({
        refresh_token,
      })

    expect(response.statusCode).toBe(401)
    expect(response.body.message).toBe('Refresh token is not valid.')
  })
})
