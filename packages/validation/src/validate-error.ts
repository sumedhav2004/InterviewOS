export class ValidationError extends Error {
    constructor(
        public readonly issues: unknown[]
    ) {
        super("Validation failed");

        this.name = "ValidationError";
    }
}