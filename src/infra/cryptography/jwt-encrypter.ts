import { Encrypter } from "@/domain/todo/application/cryptography/encrypter";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtEncrypter implements Encrypter {
	constructor(private jwtService: JwtService) { }

	encrypt(payload: Record<string, unknown>): Promise<string> {
		console.log("incriptey")
		return this.jwtService.signAsync(payload)
	}
}
