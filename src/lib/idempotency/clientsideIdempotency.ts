import axios from "axios";
import axiosRetry, { isNetworkError, isRetryableError } from "axios-retry";
import { v4 as uuid } from 'uuid';

export const idempotencyCall = async (url: string, data: any, options?: {idempotencyKey: string}) => {
    const client = axios.create();
    axiosRetry(client, {
        retries: 3,
        retryCondition: error => isNetworkError(error) || isRetryableError(error),
        retryDelay: axiosRetry.exponentialDelay
    });

    return await client.post(url, data, {
        headers: {
            "Idempotency-Key": options?.idempotencyKey ?? uuid()
        }
    });
}
