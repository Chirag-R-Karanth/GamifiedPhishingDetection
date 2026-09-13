import os
import subprocess
import sys

# Ensure PIL is installed in the system python environment
try:
    from PIL import Image, ImageDraw
except ImportError:
    print("Pillow not found, installing pillow...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pillow"])
    from PIL import Image, ImageDraw

def create_shield_icon(size):
    # Create image with transparent background
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Coordinates scaling
    scale = size / 128
    
    # Color palette
    neon_green = (0, 255, 102, 255)
    dark_gray = (9, 13, 22, 255)
    border_color = (0, 229, 255, 255) # cyan accent
    
    # Shield points: top center, top right, bottom right curve, bottom center, bottom left curve, top left
    points = [
        (64 * scale, 15 * scale),
        (104 * scale, 30 * scale),
        (104 * scale, 65 * scale),
        (64 * scale, 110 * scale),
        (24 * scale, 65 * scale),
        (24 * scale, 30 * scale)
      ]
    
    # Draw dark backing shield
    draw.polygon(points, fill=dark_gray, outline=neon_green, width=int(max(1, 4 * scale)))
    
    # Draw checkmark inside
    check_points = [
        (48 * scale, 62 * scale),
        (60 * scale, 74 * scale),
        (84 * scale, 46 * scale)
    ]
    draw.line(check_points, fill=border_color, width=int(max(1, 5 * scale)), joint="round")
    
    return img

def main():
    icons_dir = os.path.join(os.path.dirname(__file__), "icons")
    os.makedirs(icons_dir, exist_ok=True)
    
    sizes = [16, 48, 128]
    for size in sizes:
        img = create_shield_icon(size)
        path = os.path.join(icons_dir, f"icon{size}.png")
        img.save(path)
        print(f"Generated shield icon: {path} ({size}x{size})")

if __name__ == "__main__":
    main()
