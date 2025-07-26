import { Pinecone } from '@pinecone-database/pinecone';

export const PineconeDbClient = new Pinecone({
    apiKey: process.env['PINECONE_API_KEY'] ? process.env['PINECONE_API_KEY'] : '',
});