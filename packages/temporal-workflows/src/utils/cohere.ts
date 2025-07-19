import { CohereClientV2 } from 'cohere-ai';
import { appConfig } from '../../../express-api-new/src/config'

export const AICohereClientV2 = new CohereClientV2({
    token: appConfig.cohere.apiKey
});
