import axios from "axios";
import axiosRetry, { isNetworkError, isRetryableError } from "axios-retry";
import { v4 as uuid } from 'uuid';

export const idempotencyCall = async (url: string, data: any, options?: {idempotencyKey?: string, method?: string}) => {
    const client = axios.create();
    axiosRetry(client, {
        retries: 3,
        retryCondition: error => isNetworkError(error) || isRetryableError(error),
        retryDelay: axiosRetry.exponentialDelay
    });

    return await client.request({
        url: url,
        headers: {
            "idempotency-key": options?.idempotencyKey ?? uuid()
        },
        data: data,
        method: options.method ?? "POST"
    });
}
