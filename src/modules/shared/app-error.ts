export const ErrorCode = {
	INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
	VALIDATION_ERROR: "VALIDATION_ERROR",
	NOT_FOUND: "NOT_FOUND",
	CONFLICT: "CONFLICT",
	BAD_REQUEST: "BAD_REQUEST",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends Error {
	constructor(
		public readonly code: ErrorCode,
		public readonly message: string,
	) {
		super(message);

		Object.setPrototypeOf(this, new.target.prototype);
	}
}
