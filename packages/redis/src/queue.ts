
import {redis} from "./index"

const QUEUE_KEY = "execution:codeRuns";
const PROCESSING_KEY = "execution:codeRuns:processing";
const PROCESSING_TIME_KEY = "execution:codeRuns:processing:time";

export class RedisQueue<T extends {id:string}>{

    async enqueue(job: T ): Promise<void>{
        await redis.lPush(QUEUE_KEY, JSON.stringify(job))
    }

    async dequeue(): Promise<T|null>{
        const job = await redis.rPop(QUEUE_KEY)
        if(!job){
            return null
        }else{
            return JSON.parse(job)
        }
    }

    async claim(): Promise<T | null> {
        const script = `
            local job = redis.call(
                'RPOPLPUSH',
                KEYS[1],
                KEYS[2]
            )

            if not job then
                return nil
            end

            local jobId = string.match(
                job,
                '"id":"([^"]+)"'
            )

            redis.call(
                'ZADD',
                KEYS[3],
                ARGV[1],
                jobId
            )

            return job
        `;

        const result = await redis.eval(script, {
            keys: [
                QUEUE_KEY,
                PROCESSING_KEY,
                PROCESSING_TIME_KEY
            ],
            arguments: [
                Date.now().toString()
            ]
        });

        if (!result) {
            return null;
        }

        return JSON.parse(result as string);
    }

    async ack(job: T): Promise<void> {
        const serializedJob = JSON.stringify(job);

        await redis.lRem(
            PROCESSING_KEY,
            1,
            serializedJob
        );
        await redis.zRem(
            PROCESSING_TIME_KEY,
            job.id
        );
    }

    async recovery() {
        const timeoutMs = 30_000;
        const cutoff = Date.now() - timeoutMs;

        // Find jobs that have been in processing too long
        const jobIds = await redis.zRangeByScore(
            PROCESSING_TIME_KEY,
            0,
            cutoff
        );

        for (const jobId of jobIds) {

            // Watch the state we're about to modify
            await redis.watch([
                PROCESSING_KEY,
                PROCESSING_TIME_KEY
            ]);

            // Re-read processing jobs AFTER WATCH
            const processingJobs = await redis.lRange(
                PROCESSING_KEY,
                0,
                -1
            );

            // Find the actual job
            const serializedJob = processingJobs.find(
                (serialized) => {
                    const job: T = JSON.parse(serialized);
                    return job.id === jobId;
                }
            );

            // Job is no longer in processing.
            // Maybe another worker already handled it.
            if (!serializedJob) {
                await redis.unwatch();
                continue;
            }

            // Build atomic recovery transaction
            const tx = redis.multi();

            tx.lPush(
                QUEUE_KEY,
                serializedJob
            );

            tx.lRem(
                PROCESSING_KEY,
                1,
                serializedJob
            );

            tx.zRem(
                PROCESSING_TIME_KEY,
                jobId
            );

            // Execute only if watched keys haven't changed
            const result = await tx.exec();

            if (result === null) {
                console.log(
                    `Recovery conflict for job ${jobId}, retry later`
                );
            } else {
                console.log(
                    `Recovered job ${jobId}`
                );
            }
        }
    }
}