const axios = require('axios');
const express = require('express');
const cors = require("cors");
const bodyParser = require('body-parser');
const { MilvusClient, DataType } = require('@zilliz/milvus2-sdk-node');
const createClient = require('@supabase/supabase-js')
require('dotenv').config();

// Connect to milvus
const client = new MilvusClient({
    address: process.env.MILVUS_URI,
    token: process.env.MILVUS_TOKEN,
});

// Connect to supabase
const supabase = createClient.createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
)


const app = express();
app.use(cors());
app.use(bodyParser.json()); // support json encoded bodies

// POST /api/search
app.post('/api/search', (req, res) => {
    const user_query = {
        query: req.body.query,
        type: req.body.type,
    };


    supabase.from('Server').select('server_url').eq('server_name', "Kaggle_Embedding").then(r => {
        const url = r.data[0].server_url;
        axios.post(`${url}/api/embedding`, user_query)
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
    }
    ).catch(err => {
        console.log(err)
    })
});



app.listen(5000, () => {
    console.log(`Milvus server listening at http://localhost:5000`)
});