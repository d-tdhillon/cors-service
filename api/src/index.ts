import 'dotenv/config';
import { app } from '@azure/functions';

import { healthz } from './functions/healthz.js';
import { adoProxy } from './functions/adoProxy.js';

app.http('healthz', healthz);
app.http('adoProxy', adoProxy);
