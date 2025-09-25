import { randomUUID } from 'node:crypto'
import { Encrypter } from '@/domain/todo/application/cryptography/encrypter'

export class FakeEncrypter implements Encrypter {
	async encrypt(payload: Record<string, unknown>): Promise<string> {
		return JSON.stringify({ ...payload, jti: randomUUID() })
	}
}
