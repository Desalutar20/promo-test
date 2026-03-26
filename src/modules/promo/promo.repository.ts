import type { Pool } from "pg";
import { AppError, ErrorCode } from "../shared/app-error.js";
import { PromoCode } from "./domain/promocode.js";
import type { PromoRepository } from "./domain/repository.js";

export interface PromoCodeRow {
	id: string;
	code: string;
	discount_percent: number;
	activation_limit: number;
	expires_at: Date;
	created_at: Date;
}

export class PgPromoRepository implements PromoRepository {
	constructor(private readonly pool: Pool) {}

	async create(
		data: Omit<PromoCode, "id" | "createdAt" | "isExpired">,
	): Promise<PromoCode> {
		try {
			const res = await this.pool.query<PromoCodeRow>(
				`
      INSERT INTO promo_codes (code, discount_percent, activation_limit, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
				[data.code, data.discountPercent, data.activationLimit, data.expiresAt],
			);

			return this.map(res.rows[0]!);
		} catch (err: any) {
			if (err.code === "23505") {
				throw new AppError(
					ErrorCode.CONFLICT,
					`Promo code "${data.code}" already exists`,
				);
			}
			throw err;
		}
	}

	async findById(id: PromoCode["id"]): Promise<PromoCode | null> {
		const res = await this.pool.query<PromoCodeRow>(
			`SELECT * FROM promo_codes WHERE id = $1`,
			[id],
		);

		if (res.rowCount === 0) return null;

		return this.map(res.rows[0]!);
	}

	async findAll(): Promise<PromoCode[]> {
		const res = await this.pool.query<PromoCodeRow>(
			`SELECT * FROM promo_codes ORDER BY created_at DESC`,
		);

		return res.rows.map(this.map);
	}

	async activate(promoId: PromoCode["id"], email: string): Promise<void> {
		const client = await this.pool.connect();

		try {
			await client.query("BEGIN");

			const promoRes = await client.query<PromoCodeRow>(
				`SELECT * FROM promo_codes WHERE id = $1 FOR UPDATE`,
				[promoId],
			);

			if (promoRes.rowCount === 0) {
				throw new AppError(ErrorCode.NOT_FOUND, "Promo not found");
			}

			const promo = this.map(promoRes.rows[0]!);

			if (promo.isExpired()) {
				throw new AppError(ErrorCode.BAD_REQUEST, "Promo expired");
			}

			const countRes = await client.query<{ count: string }>(
				`SELECT COUNT(*) FROM promo_activations WHERE promo_code_id = $1`,
				[promoId],
			);

			const used = Number(countRes.rows[0]!.count);

			if (used >= promo.activationLimit) {
				throw new AppError(ErrorCode.CONFLICT, "Activation limit reached");
			}

			await client.query(
				`
        INSERT INTO promo_activations (promo_code_id, email)
        VALUES ($1, $2)
        `,
				[promoId, email],
			);

			await client.query("COMMIT");
		} catch (err: any) {
			await client.query("ROLLBACK");

			if (err.code === "23505") {
				throw new AppError(ErrorCode.CONFLICT, "Promo already activated");
			}

			throw err;
		} finally {
			client.release();
		}
	}

	private map(row: PromoCodeRow): PromoCode {
		return new PromoCode(
			row.id,
			row.code,
			row.discount_percent,
			row.activation_limit,
			new Date(row.expires_at),
			new Date(row.created_at),
		);
	}
}
