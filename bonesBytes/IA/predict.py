import os
import io
import base64
import requests
import torch
import torchvision.transforms as transforms
import matplotlib.pyplot as plt
import cv2
import numpy as np
from PIL import Image

from IA.model.model_def import PneumoniaCNN
from IA.util.gradcam_utils import generate_gradcam, register_hooks


def preprocess_image(img: Image.Image) -> torch.Tensor:
    """Redimensiona, convierte a tensor y normaliza."""
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,)),
    ])
    return transform(img).unsqueeze(0)  # shape [1,1,224,224]


def predict_from_tensor(input_tensor: torch.Tensor, model: PneumoniaCNN):
    """Ejecuta la inferencia y devuelve (output, confidence, index, label)."""
    with torch.no_grad():
        output = model(input_tensor)
        confidence = torch.softmax(output, dim=1).max().item()
        prediction_index = torch.argmax(output, dim=1).item()
        label = "Neumonía" if prediction_index == 1 else "Normal"
    return output, confidence, prediction_index, label


def generate_heatmap(input_tensor, model, class_idx):
    # 1) Obtén el Grad-CAM (por ejemplo 28×28 con valores 0–1)
    cam = generate_gradcam(input_tensor, model, class_idx)  # shape (h, w)

    # 2) Convierte a 0–255 uint8 y aplica colormap JET
    heatmap_uint8 = np.uint8(cam * 255)
    heatmap_color = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)  # shape (h, w, 3)

    # 3) Reconstruye la radiografía original en BGR 3 canales
    img_gray = input_tensor.squeeze(0).squeeze(0).cpu().numpy()  # shape (224,224)
    img_uint8 = np.uint8(img_gray * 255)
    img_color = cv2.cvtColor(img_uint8, cv2.COLOR_GRAY2BGR)       # shape (224,224,3)

    # 4) Resize del heatmap al tamaño de la imagen
    heatmap_resized = cv2.resize(
        heatmap_color,
        (img_color.shape[1], img_color.shape[0]),               # (width, height)
        interpolation=cv2.INTER_LINEAR
    )  # ahora shape (224,224,3)

    # 5) Superpone con pesos: 40% heatmap, 60% original
    overlay = cv2.addWeighted(heatmap_resized, 0.4, img_color, 0.6, 0)

    # 6) Guarda y codifica a base64
    output_dir = "IA/outputs"
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "heatmap.jpg")
    cv2.imwrite(out_path, overlay)

    with open(out_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    return f"data:image/jpeg;base64,{b64}"




def predict_from_url(image_url: str):
    """Descarga la imagen desde una URL, predice y devuelve resultado + heatmap."""
    try:
        response = requests.get(image_url)
        if response.status_code != 200:
            return {"error": "No se pudo descargar la imagen"}

        # Convertir a escala de grises (1 canal)
        img = Image.open(io.BytesIO(response.content)).convert("L")
        input_tensor = preprocess_image(img)

        # Cargar modelo
        model = PneumoniaCNN()
        model.load_state_dict(torch.load("IA/model/pneumonia_cnn.pt", map_location="cpu"))
        model.eval()
        register_hooks(model)

        # Inferencia
        _, confidence, idx, label = predict_from_tensor(input_tensor, model)
        heatmap = generate_heatmap(input_tensor, model, idx)

        return {"prediction": label, "confidence": confidence, "heatmap": heatmap}

    except Exception as e:
        print("❌ Error en predict_from_url:", e)
        return {"error": str(e)}


def predict_from_base64(base64_data: str):
    """Decodifica base64, predice y devuelve resultado + heatmap."""
    try:
        # Elimina encabezado si existe
        if base64_data.startswith("data:image"):
            base64_data = base64_data.split(",", 1)[1]

        image_bytes = base64.b64decode(base64_data)
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        input_tensor = preprocess_image(img)

        # Cargar modelo
        model = PneumoniaCNN()
        model.load_state_dict(torch.load("IA/model/pneumonia_cnn.pt", map_location="cpu"))
        model.eval()
        register_hooks(model)

        # Inferencia
        _, confidence, idx, label = predict_from_tensor(input_tensor, model)
        heatmap = generate_heatmap(input_tensor, model, idx)

        return {"prediction": label, "confidence": confidence, "heatmap": heatmap}

    except Exception as e:
        print("❌ Error en predict_from_base64:", e)
        return {"error": str(e)}
