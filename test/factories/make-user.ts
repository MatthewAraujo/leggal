import { faker } from '@faker-js/faker'

import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'
import { User, UserProps } from '@/domain/todo/enterprise/entities/user'
import { PrismaUserMapper } from '@/infra/database/prisma/mappers/prisma-student-mapper'

export function makeUser(override: Partial<UserProps> = {}, id?: UniqueEntityID) {
	const user = User.create(
		{
			name: faker.person.fullName(),
			email: faker.internet.email(),
			password: faker.internet.password(),
			...override,
		},
		id,
	)

	return user
}

@Injectable()
export class UserFactory {
	constructor(private prisma: PrismaService) { }

	async makePrismauser(data: Partial<UserProps> = {}): Promise<User> {
		const user = makeUser(data)

		await this.prisma.user.create({
			data: PrismaUserMapper.toPrisma(user),
		})

		return user
	}
}
