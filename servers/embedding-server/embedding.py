# !pip install sentence-transformers
# !pip install flask flask_cors pyngrok
# !pip install supabase
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from pyngrok import ngrok
import requests
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer, util

url = "https://rxyltmzhoyhvkptdmoog.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4eWx0bXpob3lodmtwdGRtb29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDQ3MTMwNDksImV4cCI6MjAyMDI4OTA0OX0.5NhtnvurC2iKIWS1rFjpYBwdxK-09sbyCEI5y02NR0k"
supabase = create_client(url, key)

ngrok.set_auth_token("2aIeZIzuDvUnBBGDiqJmfuhYIlw_3uY9Qhqud8C6yd7tAyheN")

text_model = SentenceTransformer(
    'sentence-transformers/clip-ViT-B-32-multilingual-v1')
image_model = SentenceTransformer(
    'sentence-transformers/clip-ViT-B-32')


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


@app.route('/api/embedding', methods=['POST'])
@cross_origin()
def embedding():
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

supabase.table("Server").update(
    {"server_url": url}).eq("server_name", "Kaggle_Embedding").execute()

print('Global URL:', url)
if __name__ == '__main__':
    app.run(debug=False)
