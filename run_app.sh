#!/bin/bash

# =========================
# Cấu hình
# =========================
VENV_DIR=".venv"
PYTHON_BIN="python3"
MAIN_FILE="app_ui.py"
REQUIREMENTS_FILE="requirements.txt"

# =========================
# Bước 1: Tạo môi trường ảo nếu chưa có
# =========================
if [ ! -d "$VENV_DIR" ]; then
  echo "Tạo môi trường ảo..."
  $PYTHON_BIN -m venv $VENV_DIR
  echo "Môi trường ảo đã tạo."
fi

# =========================
# Bước 2: Kích hoạt môi trường ảo
# =========================
source "$VENV_DIR/bin/activate"

# =========================
# Bước 3: Cài thư viện cần thiết
# =========================
if [ -f "$REQUIREMENTS_FILE" ]; then
  echo "Cài thư viện từ requirements.txt..."
  pip install --upgrade pip >/dev/null
  pip install -r "$REQUIREMENTS_FILE"
else
  echo "Không có requirements.txt, cài thư viện mặc định..."
  pip install pyqt5 pyinstaller whisper yt-dlp pydub
fi

# =========================
# Bước 4: Chạy ứng dụng
# =========================
echo "Chạy ứng dụng $MAIN_FILE ..."
$PYTHON_BIN $MAIN_FILE
