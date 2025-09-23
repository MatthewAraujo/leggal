import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '../../../cryptography/encrypter'
import { HashComparer } from '../../../cryptography/hash-comparer'
import { WrongCredentialsError } from '../../errors/wrong-credentials-error'
import { UsersRepository } from '../../../repositories/users-repository'
import { CacheRepository } from '@/infra/cache/cache-repository'
interface AuthenticateuserUseCaseRequest {
  email: string
  password: string
}

type AuthenticateuserUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    private cacheRepository: CacheRepository,
  ) { }

  async execute({
    email,
    password,
  }: AuthenticateuserUseCaseRequest): Promise<AuthenticateuserUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)

    if (!user) {
      return left(new WrongCredentialsError())
    }

    const isPasswordValid = await this.hashComparer.compare(password, user.password)

    if (!isPasswordValid) {
      return left(new WrongCredentialsError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
    })

    const refreshToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      type: 'refresh',
    })

    await this.cacheRepository.set(
      `refresh_token:${refreshToken}`,
      user.id.toString(),
      24 * 60 * 60 // 24 horas em segundos
    )

    return right({
      accessToken,
      refreshToken,
    })
  }
}
