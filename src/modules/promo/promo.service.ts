import { AppError, ErrorCode } from "../shared/app-error.js";
import type { PromoCode } from "./domain/promocode.js";
import type { PromoRepository } from "./domain/repository.js";

export class PromoService {
	constructor(private readonly repo: PromoRepository) {}

	async createPromo(
		data: Omit<PromoCode, "id" | "createdAt" | "isExpired">,
	): Promise<PromoCode> {
		return this.repo.create(data);
	}

	async getPromoById(id: PromoCode["id"]): Promise<PromoCode> {
		const promo = await this.repo.findById(id);

		if (!promo) {
			throw new AppError(ErrorCode.NOT_FOUND, "promo not found");
		}

		return promo;
	}

	async getAllPromos(): Promise<PromoCode[]> {
		return this.repo.findAll();
	}

	async activatePromo(promoId: PromoCode["id"], email: string): Promise<void> {
		await this.repo.activate(promoId, email);
	}
}
