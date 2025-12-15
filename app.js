require('dotenv').config();

const express = require('express');
const app = express();

app.use(require('./middleware/requestLogger'));

const cors = require('cors');
app.use(cors()); // allows all origins (test-only) to call your API

const PORT = process.env.PORT || 3000;

const { embedTokenRouter } = require('./routes/embedTokenRoute');
app.use(embedTokenRouter);

const { powerbiReportsRouter } = require('./routes/powerbiReportsRoute');
app.use('/powerbi', powerbiReportsRouter);

const { powerbiWorkspacesRouter } = require('./routes/powerbiWorkspacesRoute');
app.use('/powerbi', powerbiWorkspacesRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});