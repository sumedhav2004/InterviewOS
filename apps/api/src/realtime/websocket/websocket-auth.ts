import { verifyToken } from "@clerk/backend";
import { IdentityService } from "../../services/identity.service";

const identityService = new IdentityService();

export async function authenticateWebSocketToken(
    token: string,
): Promise<string | null> {
    try {
        const verifiedToken = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
            authorizedParties: ["http://localhost:3000"],
        });

        if (!verifiedToken.sub) {
            return null;
        }

        const user = await identityService.findOrCreateUser(
            verifiedToken.sub,
        );

        return user.id;
    } catch {
        return null;
    }
}