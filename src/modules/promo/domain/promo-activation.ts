export class PromoActivation {
	constructor(
		public readonly id: string,
		public readonly promoCodeId: string,
		public readonly email: string,
		public readonly activatedAt: Date,
	) {}
}
