import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Pool } from "pg";
import { PgPromoRepository } from "./promo.repository.js";
import {
	activateSchema,
	createPromoSchema,
	idParamsSchema,
} from "./promo.schemas.js";
import { PromoService } from "./promo.service.js";

export class PromoModule {
	private readonly service: PromoService;

	constructor(pool: Pool) {
		const repo = new PgPromoRepository(pool);
		this.service = new PromoService(repo);
		this.v1 = this.v1.bind(this);
	}

	v1(app: FastifyInstance) {
		const fastify = app.withTypeProvider<ZodTypeProvider>();

		fastify.post(
			"/promocodes",
			{
				schema: {
					body: createPromoSchema,
				},
			},
			async (req, reply) => {
				const { code, activationLimit, discountPercent, expiresAt } = req.body;

				const promo = await this.service.createPromo({
					code,
					activationLimit,
					discountPercent,
					expiresAt: new Date(expiresAt),
				});

				return reply.status(201).send(promo);
			},
		);

		fastify.get("/promocodes", async () => {
			return this.service.getAllPromos();
		});

		fastify.get(
			"/promocodes/:id",
			{
				schema: {
					params: idParamsSchema,
				},
			},
			async (req) => {
				return this.service.getPromoById(req.params.id);
			},
		);

		fastify.post(
			"/promocodes/:id/activate",
			{
				schema: {
					params: idParamsSchema,
					body: activateSchema,
				},
			},
			async (req, reply) => {
				const { id } = req.params;
				const { email } = req.body;

				await this.service.activatePromo(id, email);

				return reply.status(204).send();
			},
		);
	}
}
