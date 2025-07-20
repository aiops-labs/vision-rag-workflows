"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const EnvironmentSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).pipe(zod_1.z.number().min(1).max(65535)).default('3000'),
    COHERE_API_KEY: zod_1.z.string().min(1, 'COHERE_API_KEY is required'),
    PINECONE_API_KEY: zod_1.z.string().min(1, 'PINECONE_API_KEY is required'),
    PINECONE_ENVIRONMENT: zod_1.z.string().min(1, 'PINECONE_ENVIRONMENT is required'),
    PINECONE_INDEX_NAME: zod_1.z.string().min(1, 'PINECONE_INDEX_NAME is required'),
    RATE_LIMIT_WINDOW_MS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).default('900000'),
    RATE_LIMIT_MAX_REQUESTS: zod_1.z.string().transform(Number).pipe(zod_1.z.number().positive()).default('100'),
});
const envParseResult = EnvironmentSchema.safeParse(process.env);
if (!envParseResult.success) {
    console.error('❌ Invalid environment variables:');
    console.error(envParseResult.error.format());
    process.exit(1);
}
exports.config = envParseResult.data;
exports.appConfig = {
    server: {
        port: exports.config.PORT,
        nodeEnv: exports.config.NODE_ENV,
        isDevelopment: exports.config.NODE_ENV === 'development',
        isProduction: exports.config.NODE_ENV === 'production',
        isTest: exports.config.NODE_ENV === 'test',
    },
    cohere: {
        apiKey: exports.config.COHERE_API_KEY,
        model: 'embed-v4.0',
    },
    pinecone: {
        apiKey: exports.config.PINECONE_API_KEY,
        environment: exports.config.PINECONE_ENVIRONMENT,
        indexName: exports.config.PINECONE_INDEX_NAME,
    },
    rateLimit: {
        windowMs: exports.config.RATE_LIMIT_WINDOW_MS,
        maxRequests: exports.config.RATE_LIMIT_MAX_REQUESTS,
    },
};
//# sourceMappingURL=index.js.map