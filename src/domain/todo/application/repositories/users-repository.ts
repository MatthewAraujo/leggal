import { User } from "../../enterprise/entities/user";

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract create(User: User): Promise<void>
  abstract save(User: User): Promise<void>
}
