import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { makeUser } from 'test/factories/make-user'
import { AuthenticateUserUseCase } from './authenticate-student'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryCacheRepository } from 'test/repositories/in-memory-cache-repository'

let inMemoryusersRepository: InMemoryUsersRepository
let inMemoryCacheRepository: InMemoryCacheRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter

let sut: AuthenticateUserUseCase

describe('Authenticate user', () => {
  beforeEach(() => {
    inMemoryusersRepository = new InMemoryUsersRepository()
    inMemoryCacheRepository = new InMemoryCacheRepository()
    fakeHasher = new FakeHasher()
    encrypter = new FakeEncrypter()

    sut = new AuthenticateUserUseCase(inMemoryusersRepository, fakeHasher, encrypter, inMemoryCacheRepository)
  })

  it('should be able to authenticate a user', async () => {
    const user = makeUser({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    })

    inMemoryusersRepository.items.push(user)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    })
  })
})
