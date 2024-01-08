const axios = require('axios');
const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const { MilvusClient, DataType } = require('@zilliz/milvus2-sdk-node');
require('dotenv').config();

// Connect to milvus
const client = new MilvusClient({
    address: process.env.MILVUS_URI,
    token: process.env.MILVUS_TOKEN,
});


const app = express();
app.use(cors());
app.use(bodyParser.json()); // support json encoded bodies

// POST /api/search
app.post('/api/search', (req, res) => {
    const user_query = {
        query: req.body.query,
        type: req.body.type,
    };

    axios.post(`https://example.com/api/embedding`, user_query)
        .then(response => {
            const vector = response.data.embedding;
            client.search({
                collection_name: "JapanGuideImageEmbedding",
                data: vector,
                output_fields: ["name", "subtitle", "description", "link_image"],
                limit: 5
            }).then(searchResponse => {
                // console.log(searchResponse);
                res.json(searchResponse.results); // Send the searchResponse as JSON
            }).catch(searchErr => {
                // console.log(searchErr);
                res.status(500).send("Error in searching"); // Sending a 500 error status in case of search failure
            });
        }).catch(axiosErr => {
            // console.log(axiosErr.response.data);
            res.status(500).send("Axios error"); // Sending a 500 error status in case of Axios failure
        });
});



app.listen(5000, () => {
    console.log(`Milvus server listening at http://localhost:5000`)
});