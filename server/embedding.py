# !pip install sentence-transformers
# !pip install flask flask_cors pyngrok
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from pyngrok import ngrok
import requests
from sentence_transformers import SentenceTransformer, util

ngrok.set_auth_token("2aIeZIzuDvUnBBGDiqJmfuhYIlw_3uY9Qhqud8C6yd7tAyheN")

text_model = SentenceTransformer(
    'sentence-transformers/clip-ViT-B-32-multilingual-v1')
image_model = SentenceTransformer(
    'sentence-transformers/clip-ViT-B-32')


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


# Get and return the sum of two numbers
@app.route('/api/embedding', methods=['POST'])
@cross_origin()
def add():
    # Message format
    # {
    #     "query": "Hello World" | "https://www.google.com/example.png",
    #     "type": "text" | "image"
    # }

    data = request.get_json()

    if data["type"] == "text":
        text = data["query"]
        embedding = text_model.encode(text).tolist()
        return jsonify({
            "embedding": embedding
        })

    elif data["type"] == "image":
        image_path = data["query"]
        image = Image.open(requests.get(image_path, stream=True).raw)
        embedding = image_model.encode(image).tolist()
        return jsonify({
            "embedding": embedding
        })

    else:
        return jsonify({
            "error": "We only support text and image embedding"
        })


url = ngrok.connect(5000).public_url
print('Global URL:', url)
if __name__ == '__main__':
    app.run(debug=False)
