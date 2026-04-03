const app = require('./app');
const dotenv = require('dotenv');

dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
