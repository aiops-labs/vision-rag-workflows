import { CohereClientV2 } from 'cohere-ai';
import { appConfig } from '../../../express-api/src/config'

export const AICohereClientV2 = new CohereClientV2({
    token: appConfig.cohere.apiKey
});
