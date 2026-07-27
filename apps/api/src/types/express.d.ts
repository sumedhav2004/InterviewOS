import { User } from "@interview-os/database"


declare global{
    namespace Express{
        interface Request{
            user: User
        }
    }
}

export {}