const express = require('express');
const puppeteer = require('puppeteer');
require('dotenv').config();  // Load environment variables from .env

const app = express();

// Environment variable for the News API key
const apiKey = process.env.NEWS_API;

app.get('/fetch-data', async (req, res) => {
  const query = req.query.query || 'default';  // Get the search query from the request, default if none

  try {
    // Launch a headless browser instance
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Construct the API URL with query and API key
    const apiUrl = `https://newsapi.org/v2/everything?q=${query}&apiKey=${apiKey}`;
    
    // Navigate to the API URL
    await page.goto(apiUrl, {
      waitUntil: 'networkidle2',  // Wait until the network is idle (all requests finished)
    });

    // Extract the response data from the page content
    const data = await page.evaluate(() => {
      return document.body.innerText;  // Extract the body content (JSON response from the API)
    });

    await browser.close();  // Close the browser

    res.json(JSON.parse(data));  // Send the parsed data back to the frontend
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');  // Send an error response
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
