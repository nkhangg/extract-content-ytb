from flask import Flask, request, jsonify
from threading import Thread
from video_to_text import download_audio, transcribe_audio, OUTPUT_DIR
from pathlib import Path
import shutil
from flask_cors import CORS
import os

app = Flask(__name__)

# ✅ Cho phép tất cả domain (bao gồm localhost, 127.0.0.1, v.v.) truy cập API
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/extract", methods=["POST"])
def extract_audio():
    data = request.get_json(force=True)
    link = data.get("link")
    model = data.get("model", "base")

    if not link:
        return jsonify({"error": "Thiếu link YouTube"}), 400

    try:
        # 1️⃣ Download audio
        title, audio_file = download_audio(link)
        video_folder = os.path.join(OUTPUT_DIR, title)
        os.makedirs(video_folder, exist_ok=True)

        # 2️⃣ Di chuyển audio vào folder
        audio_dest = os.path.join(video_folder, os.path.basename(audio_file))
        shutil.move(audio_file, audio_dest)

        # 3️⃣ Transcribe audio
        transcript_path = transcribe_audio(audio_dest, model_name=model)

        # 4️⃣ Trả kết quả về client
        return jsonify({
            "status": "done",
            "message": "Xử lý hoàn tất",
            "video": {
                "title": title,
                "folder": os.path.realpath(video_folder),
                "audio_file": os.path.realpath(audio_dest),
                "transcript_file": os.path.basename(transcript_path)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =========================================================
# 📂 API: liệt kê thư mục downloads
# =========================================================
@app.route("/downloads", methods=["GET"])
def list_downloads():
    base_path = Path(OUTPUT_DIR)

    def build_tree(path: Path):
        """
        Đệ quy tạo cấu trúc cây từ thư mục.
        """
        node = {
            "name": path.name,
            "path": str(path.relative_to(base_path)),
        }

        if path.is_dir():
            node["type"] = "folder"
            node["children"] = [build_tree(p) for p in sorted(path.iterdir())]
        else:
            node["type"] = "file"
            node["size_kb"] = round(path.stat().st_size / 1024, 2)

        return node

    if not base_path.exists():
        return jsonify({"tree": []})

    tree = build_tree(base_path)
    return jsonify(tree)


# =========================================================
# 🏠 Root
# =========================================================
@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "Welcome to YouTube Audio Transcriber API 🚀"})

# =========================================================
# 🚀 Run
# =========================================================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
