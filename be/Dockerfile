# ========================
# 🧩 Base image
# ========================
FROM python:3.10-slim

# Set working dir
WORKDIR /app

# Copy requirements trước để tận dụng cache layer
COPY requirements.txt .

# Cài ffmpeg & các dependency
RUN apt-get update && apt-get install -y \
    ffmpeg git && \
    pip install --no-cache-dir -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy toàn bộ project
COPY . .

# Tạo thư mục downloads
RUN mkdir -p downloads

# Expose port Flask
EXPOSE 5000

# Chạy app Flask
CMD ["python", "api.py"]
