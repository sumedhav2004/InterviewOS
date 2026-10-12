import { AppError } from "../../core/errors/app-error";

export function getRequiredRouteParam(value: string | string[] | undefined, name: string): string {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  throw new AppError(`Invalid or missing route parameter: ${name}`, 400, "INVALID_ROUTE_PARAM");
}
