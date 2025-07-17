### model/model_def.py
import torch.nn as nn

class PneumoniaCNN(nn.Module):
    def __init__(self):
        super(PneumoniaCNN, self).__init__()

        # Bloques convolucionales que terminan en 64×7×7
        self.conv_layers = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, stride=1, padding=1),  # 1×224×224 → 32×224×224
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                                     # → 32×112×112

            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1), # → 64×112×112
            nn.ReLU(),
            nn.MaxPool2d(2, 2),                                     # → 64×56×56

            # Pooling adaptativo para forzar salidas 7×7
            nn.AdaptiveAvgPool2d((7, 7))                            # → 64×7×7
        )

        # Clasificador final (4 módulos, índices 0–3) coincidiendo con el checkpoint
        self.fc_layers = nn.Sequential(
            nn.Flatten(),                # 0: 64×7×7 → 3136
            nn.Linear(64 * 7 * 7, 128),  # 1
            nn.ReLU(),                   # 2
            nn.Linear(128, 2)            # 3
        )

    def forward(self, x):
        x = self.conv_layers(x)
        x = self.fc_layers(x)
        return x
