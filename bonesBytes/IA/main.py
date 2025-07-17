import os
import sys
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS

# Asegura el path correcto
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from IA.predict import predict_from_base64

# Configuración de Firebase Realtime Database
import pyrebase

firebase_config = {
    "apiKey": "AIzaSyAELWvSvNwuWnp5Jh2c6QT2DIi8_kmQ4_c",
    "authDomain": "bonesbytes.firebaseapp.com",
    "databaseURL": "https://bonesbytes-default-rtdb.firebaseio.com",  # ✅ Muy importante
    "projectId": "bonesbytes",
    "storageBucket": "bonesbytes.firebasestorage.app",
    "messagingSenderId": "644961700871",
    "appId": "1:644961700871:web:6f011ebbbfa626ae40aea2"
}

firebase = pyrebase.initialize_app(firebase_config)
db = firebase.database()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/", methods=["GET"])
def home():
    return "✅ XrayAssist backend está activo."

@app.route("/predict-firebase", methods=["POST"])
def predict_firebase():
    import time
    from IA.predict import predict_from_base64

    data = request.get_json()
    image_id = data.get("image_id")

    if not image_id:
        return jsonify({"error": "Falta el ID de la imagen"}), 400

    # 🔁 Reintento hasta 10 veces (total ~5 segundos)
    snapshot = None
    for attempt in range(10):
        snapshot = db.child("radiografias").child(image_id).get()
        if snapshot.val():
            break
        print(f"⏳ Intento {attempt+1}/10 - Esperando imagen en Firebase...")
        time.sleep(0.5)

    if not snapshot or not snapshot.val():
        return jsonify({
            "error": f"Imagen con ID {image_id} no encontrada tras múltiples intentos."
        }), 404

    base64_img = dict(snapshot.val()).get("base64")
    if not base64_img:
        return jsonify({"error": "Campo base64 no disponible"}), 400

    try:
        result = predict_from_base64(base64_img)
        return jsonify(result)
    except Exception as e:
        print("❌ Error en la predicción:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)