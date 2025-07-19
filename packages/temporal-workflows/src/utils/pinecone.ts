import { Pinecone } from '@pinecone-database/pinecone';
import { appConfig } from '../../../express-api/src/config'

export const PineconeDbClient = new Pinecone({
    apiKey: appConfig.pinecone.apiKey,
});