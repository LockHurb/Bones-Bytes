### utils/gradcam_utils.py
import torch

# Diccionarios globales para activaciones y gradientes
activations = {}
gradients = {}

def forward_hook(module, input, output):
    activations["value"] = output.detach()

def backward_hook(module, grad_input, grad_output):
    gradients["value"] = grad_output[0].detach()

def register_hooks(model):
    # Apunta al último bloque convolucional (ajustar si cambias arquitectura)
    target_layer = model.conv_layers[4]
    target_layer.register_forward_hook(forward_hook)
    target_layer.register_backward_hook(backward_hook)

def generate_gradcam(input_tensor, model, class_idx):
    model.zero_grad()
    output = model(input_tensor)
    output[0, class_idx].backward()

    grad = gradients["value"][0]
    act = activations["value"][0]

    weights = grad.mean(dim=(1, 2))
    cam = torch.relu((weights[:, None, None] * act).sum(0))
    cam = cam / cam.max()

    return cam.cpu().numpy()