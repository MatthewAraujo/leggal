import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { makeuser } from 'test/factories/make-user'
import { AuthenticateuserUseCase } from './authenticate-student'
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'

let inMemoryusersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter

let sut: AuthenticateuserUseCase

describe('Authenticate user', () => {
	beforeEach(() => {
		inMemoryusersRepository = new InMemoryUsersRepository()
		fakeHasher = new FakeHasher()
		encrypter = new FakeEncrypter()

		sut = new AuthenticateuserUseCase(inMemoryusersRepository, fakeHasher, encrypter)
	})

	it('should be able to authenticate a user', async () => {
		const user = makeuser({
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
		})
	})
})
