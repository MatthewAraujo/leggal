import { Encrypter } from "@/domain/todo/application/cryptography/encrypter";
import { randomUUID } from 'crypto'

export class FakeEncrypter implements Encrypter {
	async encrypt(payload: Record<string, unknown>): Promise<string> {
		return JSON.stringify({ ...payload, jti: randomUUID() })
	}
}
