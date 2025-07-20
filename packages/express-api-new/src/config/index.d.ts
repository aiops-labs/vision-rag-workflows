export declare const config: {
    NODE_ENV: "development" | "production" | "test";
    PORT: number;
    COHERE_API_KEY: string;
    PINECONE_API_KEY: string;
    PINECONE_ENVIRONMENT: string;
    PINECONE_INDEX_NAME: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
};
export declare const appConfig: {
    readonly server: {
        readonly port: number;
        readonly nodeEnv: "development" | "production" | "test";
        readonly isDevelopment: boolean;
        readonly isProduction: boolean;
        readonly isTest: boolean;
    };
    readonly cohere: {
        readonly apiKey: string;
        readonly model: "embed-v4.0";
    };
    readonly pinecone: {
        readonly apiKey: string;
        readonly environment: string;
        readonly indexName: string;
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly maxRequests: number;
    };
};
//# sourceMappingURL=index.d.ts.map