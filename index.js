require("dotenv").config();
const express = require("express");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8876;

let dataStore = [];
const storageLimit = 10;

const authToken = process.env.AUTH_TOKEN;

const isValidIdentifier = (id) => ["p", "f", "e", "r"].includes(id);

const getAPIEndpoint = (id) => {
  switch (id) {
    case "p":
      return "http://example.com/api/primes";
    case "f":
      return "http://example.com/api/fibonacci";
    case "e":
      return "http://example.com/api/even";
    case "r":
      return "http://example.com/api/random";
    default:
      return "";
  }
};

const fetchDataFromAPI = async (id) => {
  try {
    const endpoint = getAPIEndpoint(id);
    const response = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 500,
    });
    return response.data.numbers || [];
  } catch (error) {
    console.error("Error fetching data:", error.message);
    return [];
  }
};

const calculateAverage = (nums) => {
  if (nums.length === 0) return 0;
  const sum = nums.reduce((acc, num) => acc + num, 0);
  return sum / nums.length;
};

app.get("/numbers/:id", async (req, res) => {
  const { id } = req.params;

  if (!isValidIdentifier(id)) {
    return res.status(400).json({ error: "Invalid identifier" });
  }

  const fetchedData = await fetchDataFromAPI(id);

  if (fetchedData.length > 0) {
    fetchedData.forEach((num) => {
      if (!dataStore.includes(num)) {
        dataStore.push(num);
        if (dataStore.length > storageLimit) {
          dataStore.shift();
        }
      }
    });
  }

  const avg = calculateAverage(dataStore);

  res.json({
    previousData: dataStore.slice(0, -fetchedData.length),
    currentData: dataStore,
    fetchedData,
    average: avg.toFixed(2),
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
