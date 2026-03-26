import { z } from "zod";

export const createPromoSchema = z.object({
	code: z.string().min(3).max(50),
	discountPercent: z.number().int().min(1).max(100),
	activationLimit: z.number().int().min(1),
	expiresAt: z.iso.datetime(),
});

export const activateSchema = z.object({
	email: z.string().email(),
});

export const idParamsSchema = z.object({
	id: z.string().uuid(),
});
