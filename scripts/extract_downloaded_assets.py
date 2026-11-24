import zipfile
import os

base_dir = r"D:\New folder (2)\data\desi_3d_library\sketchfab_downloads"
zips = [
    "futuristic_flying_robot.zip",
    "poddy_m1.zip",
    "indian_chai_glass.zip",
    "chai_glass_indian_style.zip"
]

for z in zips:
    z_path = os.path.join(base_dir, z)
    out_dir = os.path.join(base_dir, z.replace(".zip", ""))
    os.makedirs(out_dir, exist_ok=True)
    with zipfile.ZipFile(z_path, 'r') as zip_ref:
        zip_ref.extractall(out_dir)
    print(f"Extracted {z} into {out_dir}")
    # List files
    for root, dirs, files in os.walk(out_dir):
        for f in files:
            rel = os.path.relpath(os.path.join(root, f), out_dir)
            print(f"  - {rel}")
