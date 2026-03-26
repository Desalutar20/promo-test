import z from "zod";
import { databaseConfigSchema } from "./database.config.js";

declare module "fastify" {
	interface FastifyInstance {
		config: Config;
	}
}

const applicationConfigSchema = z.object({
	port: z.coerce.number().min(1).max(65535),
});

const configSchema = z.object({
	application: applicationConfigSchema,
	database: databaseConfigSchema,
});

export type ApplicationConfig = z.infer<typeof applicationConfigSchema>;
export type Config = z.infer<typeof configSchema>;

export const setupConfig = (): Config => {
	return configSchema.parse({
		application: {
			port: process.env.APPLICATION_PORT,
		},
		database: {
			name: process.env.DATABASE_NAME,
			host: process.env.DATABASE_HOST,
			port: process.env.DATABASE_PORT,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
			ssl: process.env.DATABASE_SSL,
			poolMin: process.env.DATABASE_POOL_MIN,
			poolMax: process.env.DATABASE_POOL_MAX,
		},
	});
};
