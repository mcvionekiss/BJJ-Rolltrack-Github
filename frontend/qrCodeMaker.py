import qrcode
from PIL import Image

# Path to the BJJ RollTrack logo
logo_path = "src/assets/logo.jpeg"

# URL or data you want to encode in the QR code
qr_data = "http://18.118.16.74:3000/checkin"

# Generate a base QR code
qr = qrcode.QRCode(
    version=6,
    error_correction=qrcode.constants.ERROR_CORRECT_H,  # High error correction for logo
    box_size=10,
    border=4
)
qr.add_data(qr_data)
qr.make(fit=True)

# Create QR code image
qr_img = qr.make_image(fill="black", back_color="white").convert("RGBA")

# Load and resize the logo
logo = Image.open(logo_path).convert("RGBA")

# Resize logo (adjust as needed)
logo_size = (qr_img.size[0] // 4, qr_img.size[1] // 4)  # 1/4th of QR code size
logo = logo.resize(logo_size, Image.LANCZOS)

# Create a white background slightly larger than the logo (for outline effect)
border_size = 10  # Adjust border thickness
bordered_logo_size = (logo_size[0] + border_size * 2, logo_size[1] + border_size * 2)
bordered_logo = Image.new("RGBA", bordered_logo_size, "white")

# Paste the logo in the center of the white background
bordered_logo.paste(logo, (border_size, border_size), logo)

# Calculate position to paste the logo (centered)
pos = ((qr_img.size[0] - bordered_logo.size[0]) // 2, (qr_img.size[1] - bordered_logo.size[1]) // 2)

mask = bordered_logo.split()[3] if bordered_logo.mode == "RGBA" else None

# Paste the logo onto the QR code
qr_img.paste(bordered_logo, pos, mask)

# Save the QR code
qr_img.save("bjj_rolltrack_qr.png")

# Show the QR code
qr_img.show()