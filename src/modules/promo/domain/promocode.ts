export class PromoCode {
	constructor(
		public readonly id: string,
		public readonly code: string,
		public readonly discountPercent: number,
		public readonly activationLimit: number,
		public readonly expiresAt: Date,
		public readonly createdAt: Date,
	) {}

	isExpired(): boolean {
		return this.expiresAt.getTime() <= Date.now();
	}
}
