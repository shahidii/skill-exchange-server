const dotenv = require("dotenv").config({ path: require('path').resolve(__dirname, '../.env') });
const app = require("./app");
const { logger } = require("../utils/logger");

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
    logger.info(`Server running at http://localhost:${port}`);
});
