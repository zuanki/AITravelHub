from transformers import AutoTokenizer, pipeline, logging, AutoModelForCausalLM
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
import time
import torch
import re
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from pyngrok import ngrok

ngrok.set_auth_token("2aIeZIzuDvUnBBGDiqJmfuhYIlw_3uY9Qhqud8C6yd7tAyheN")

model_name_or_path = "TheBloke/Mistral-7B-Instruct-v0.1-GPTQ"
model_basename = "model"

use_triton = False

tokenizer = AutoTokenizer.from_pretrained(model_name_or_path, use_fast=True)

model = AutoGPTQForCausalLM.from_quantized(model_name_or_path,
                                           model_basename=model_basename,
                                           use_safetensors=True,
                                           trust_remote_code=True,
                                           device="cuda:0",
                                           use_triton=use_triton,
                                           quantize_config=None)


# Prevent printing spurious transformers error when using pipeline with AutoGPTQ
logging.set_verbosity(logging.CRITICAL)


@torch.no_grad()
def generate_ans(msg: str) -> str:
    prompt = msg

    prompt_template = f'''[INST]
    {prompt}
    [/INST]

    '''

    input_ids = tokenizer(prompt_template, return_tensors="pt")

    outputs = model.generate(
        inputs=input_ids["input_ids"].to("cuda"),
        attention_mask=input_ids["attention_mask"].to("cuda"),
        do_sample=True,
        temperature=0.7,
        top_k=10,
        top_p=0.95,
        max_new_tokens=512,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.pad_token_id
    )

    response = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

    res = re.split(r'\[\/INST\]', response)[1]
    res = re.sub(r'\n\s*\n', '\n\n', res)
    res = res.strip()

    return res


app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


# Get and return the sum of two numbers
@app.route('/chat/completions', methods=['POST'])
@cross_origin()
def add():
    data = request.get_json()
    input = data['message']
    bot_response = generate_ans(input)

    return jsonify({'result': bot_response})


url = ngrok.connect(5000).public_url
print('Global URL:', url)
