import { DomainEvents } from '@/core/events/domain-events'
import { UsersRepository } from '@/domain/todo/application/repositories/users-repository'
import { User } from '@/domain/todo/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
	public items: User[] = []

	async findByEmail(email: string) {
		const user = this.items.find((item) => item.email === email)

		if (!user) {
			return null
		}

		return user
	}

	async create(user: User) {
		this.items.push(user)

		DomainEvents.dispatchEventsForAggregate(user.id)
	}

	async findById(id: string) {
		const user = this.items.find((item) => item.id.toString() === id)

		if (!user) {
			return null
		}

		return user
	}

	save(User: User): Promise<void> {
		throw new Error('Method not implemented.')
	}
}
