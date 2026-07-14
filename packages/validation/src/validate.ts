import { ZodError, ZodTypeAny } from "zod";
import { ValidationError } from "./validate-error";

export function validate<T extends ZodTypeAny>(
    schema: T,
    data: unknown
) {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new ValidationError(error.issues);
        }

        throw error;
    }
}