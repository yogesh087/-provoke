const express = require('express');
const axios = require('axios');
const app = express();
const {  notFound } = require('./middleware/error.js');
const PORT = 3000;

app.use(express.json());

app.post('/convert', async (req, res) => {
  try {
    const { toConvert } = req.body;
    const conversions = [];

    for (const item of toConvert) {
      const { amount, from, to } = item;
      const exchangeValues = [];

      for (const targetCurrency of to) {
        if (from === targetCurrency) {
          exchangeValues.push({ to: targetCurrency, value: amount });
        } else {
          const response = await axios.get(
            `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/${from.toLowerCase()}/${targetCurrency.toLowerCase()}.json`
          );

          if (response.status === 200 && response.data[targetCurrency.toLowerCase()]) {
            const conversionRate = response.data[targetCurrency.toLowerCase()];
            const convertedAmount = amount * conversionRate;
            exchangeValues.push({ to: targetCurrency, value: convertedAmount });
          }
        }
      }

      conversions.push({ amount, from, exchangeValues });
    }

    res.status(200).json({ conversions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Error Handling middlewares 
app.use(notFound); // if no route is found then this middleware will run

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
