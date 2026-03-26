import type { PromoCode } from "./promocode.js";

export interface PromoRepository {
	create(
		data: Omit<PromoCode, "id" | "createdAt" | "isExpired">,
	): Promise<PromoCode>;

	findById(id: PromoCode["id"]): Promise<PromoCode | null>;

	findAll(): Promise<PromoCode[]>;

	activate(promoId: PromoCode["id"], email: string): Promise<void>;
}
