import express from 'express';
import { rootHandler } from './handlers'
import { RGSHandler } from './rgs/handler'

import { serve, setup } from 'swagger-ui-express'
import * as swaggerDocument from './swagger.json'

const app = express();
const port = process.env.PORT || '8000';

app.use('/api-docs', serve, setup(swaggerDocument));
app.get('/', rootHandler);
app.get('/rgs/:version?', RGSHandler)

app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
