import Fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import { Pool } from "pg";
import type { Config } from "./config/config.js";
import { PromoModule } from "./modules/promo/promo.js";
import errorHandler from "./plugins/internal/error-handler.js";

export function buildApp(config: Config) {
	const app = Fastify({
		logger: true,
	});

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	app.register(errorHandler);

	const pool = new Pool({
		host: config.database.host,
		port: config.database.port,
		database: config.database.name,
		user: config.database.user,
		password: config.database.password,
		ssl: config.database.ssl,
		min: config.database.poolMin ?? 2,
		max: config.database.poolMax ?? 10,
	});

	const promo = new PromoModule(pool);
	app.register(promo.v1, { prefix: "/api/v1" });

	app.get("/health", async () => {
		return { status: "ok" };
	});

	return app;
}
