import { RefreshTokenUseCase } from './refresh-token'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { makeUser } from 'test/factories/make-user'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { InvalidRefreshTokenError } from '../../errors/invalid-refresh-token-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { InMemoryCacheRepository } from 'test/repositories/in-memory-cache-repository'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryCacheRepository: InMemoryCacheRepository
let fakeEncrypter: FakeEncrypter
let sut: RefreshTokenUseCase

describe('Refresh Token', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryCacheRepository = new InMemoryCacheRepository()
    fakeEncrypter = new FakeEncrypter()
    sut = new RefreshTokenUseCase(
      inMemoryUsersRepository,
      fakeEncrypter,
      inMemoryCacheRepository,
    )
  })

  it('should be able to refresh token', async () => {
    const user = makeUser()
    await inMemoryUsersRepository.create(user)

    const refreshToken = await fakeEncrypter.encrypt({
      sub: user.id.toString(),
      type: 'refresh',
    })

    await inMemoryCacheRepository.set(
      `refresh_token:${refreshToken}`,
      user.id.toString(),
      24 * 60 * 60,
    )

    const result = await sut.execute({
      refreshToken,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.accessToken).toBeTruthy()
      expect(result.value.refreshToken).toBeTruthy()
      expect(result.value.accessToken).not.toBe(refreshToken)
      expect(result.value.refreshToken).not.toBe(refreshToken)
    }
  })

  it('should not be able to refresh token with invalid refresh token', async () => {
    const result = await sut.execute({
      refreshToken: 'invalid-refresh-token',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('should not be able to refresh token if user does not exist', async () => {
    const refreshToken = await fakeEncrypter.encrypt({
      sub: 'non-existent-user-id',
      type: 'refresh',
    })

    await inMemoryCacheRepository.set(
      `refresh_token:${refreshToken}`,
      'non-existent-user-id',
      24 * 60 * 60,
    )

    const result = await sut.execute({
      refreshToken,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('should invalidate old refresh token after successful refresh', async () => {
    const user = makeUser()
    await inMemoryUsersRepository.create(user)

    const refreshToken = await fakeEncrypter.encrypt({
      sub: user.id.toString(),
      type: 'refresh',
    })

    await inMemoryCacheRepository.set(
      `refresh_token:${refreshToken}`,
      user.id.toString(),
      24 * 60 * 60,
    )

    await sut.execute({
      refreshToken,
    })

    const result = await sut.execute({
      refreshToken,
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })
})
