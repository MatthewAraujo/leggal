import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Encrypter } from '../../../cryptography/encrypter'
import { UsersRepository } from '../../../repositories/users-repository'
import { InvalidRefreshTokenError } from '../../errors/invalid-refresh-token-error'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { CacheRepository } from '@/infra/cache/cache-repository'

interface RefreshTokenUseCaseRequest {
  refreshToken: string
}

type RefreshTokenUseCaseResponse = Either<
  InvalidRefreshTokenError | ResourceNotFoundError,
  {
    accessToken: string
    refreshToken: string
  }
>

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private encrypter: Encrypter,
    private cacheRepository: CacheRepository,
  ) { }

  async execute({
    refreshToken,
  }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const userId = await this.cacheRepository.get(`refresh_token:${refreshToken}`)

    if (!userId) {
      return left(new InvalidRefreshTokenError())
    }

    const user = await this.usersRepository.findById(userId)

    if (!user) {
      return left(new ResourceNotFoundError())
    }

    const accessToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      iat: Date.now(),
    })

    const newRefreshToken = await this.encrypter.encrypt({
      sub: user.id.toString(),
      type: 'refresh',
      iat: Date.now(),
    })


    await this.cacheRepository.delete(`refresh_token:${refreshToken}`)

    await this.cacheRepository.set(
      `refresh_token:${newRefreshToken}`,
      user.id.toString(),
      24 * 60 * 60 // 24 horas em segundos
    )

    return right({
      accessToken,
      refreshToken: newRefreshToken,
    })
  }
}
