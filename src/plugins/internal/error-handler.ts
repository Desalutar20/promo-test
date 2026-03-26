import fp from "fastify-plugin";
import {
	hasZodFastifySchemaValidationErrors,
	isResponseSerializationError,
} from "fastify-type-provider-zod";
import { AppError, ErrorCode } from "../../modules/shared/app-error.js";

export default fp(async (fastify) => {
	fastify.setErrorHandler((err, req, reply) => {
		let code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR;

		if (hasZodFastifySchemaValidationErrors(err)) {
			code = ErrorCode.BAD_REQUEST;

			return reply.code(400).send({
				error: code,
				errors: (
					err.validation as { instancePath: string; message: string }[]
				).reduce((acc: Record<string, string>, err) => {
					if (!acc[err.instancePath]) {
						acc[err.instancePath.slice(1)] = err.message;
					}

					return acc;
				}, {}),
			});
		}

		if (isResponseSerializationError(err)) {
			return reply.code(500).send({
				error: code,
				message: "Internal server error",
			});
		}

		if (
			err instanceof AppError &&
			err.code !== ErrorCode.INTERNAL_SERVER_ERROR
		) {
			code = err.code;

			return reply.status(mapErrorToHttpStatusCode(err.code)).send({
				error: code,
				message: err.message,
			});
		}

		fastify.log.error(
			{
				err,
				request: {
					method: req.method,
					url: req.url,
					query: req.query,
					params: req.params,
				},
			},
			"Unhandled error occurred",
		);

		return reply.status(500).send({
			error: code,
			message: "Internal server error",
		});
	});
});

function mapErrorToHttpStatusCode(code: ErrorCode): number {
	switch (code) {
		case ErrorCode.NOT_FOUND:
			return 404;
		case ErrorCode.CONFLICT:
			return 409;
		case ErrorCode.BAD_REQUEST:
			return 400;
		case ErrorCode.VALIDATION_ERROR:
			return 422;
		default:
			return 500;
	}
}
