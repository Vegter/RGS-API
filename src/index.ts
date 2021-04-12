import express from 'express';
import { rootHandler } from './handlers'
import { RGSHandler } from './rgs/handler'

const app = express();
const port = process.env.PORT || '8000';

app.get('/', rootHandler);
app.get('/rgs/:version?', RGSHandler)

app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
