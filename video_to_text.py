# video_to_text.py
import os
import re
import sys
import yt_dlp
import whisper
from pathlib import Path
from pydub import AudioSegment, silence

# ========================
# 🧩 Cấu hình
# ========================
OUTPUT_DIR = "downloads"  # Thư mục chứa kết quả
MODELS_DIR = 'models'


# ========================
# 💻 Thiết lập ffmpeg cho PyInstaller
# ========================
if getattr(sys, 'frozen', False):
    # Khi đóng gói PyInstaller
    base_path = sys._MEIPASS
else:
    base_path = os.path.abspath(".")

ffmpeg_dir = os.path.join(base_path, "bin")

# Cập nhật PATH
os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

# Gán cụ thể binary path
ffmpeg_path = os.path.join(ffmpeg_dir, "ffmpeg")
ffprobe_path = os.path.join(ffmpeg_dir, "ffprobe")

os.environ["FFMPEG_BINARY"] = ffmpeg_path
os.environ["FFPROBE_BINARY"] = ffprobe_path

# Kiểm tra xem có file tồn tại không
print(f"🔍 ffmpeg path: {ffmpeg_path} => {os.path.exists(ffmpeg_path)}")
print(f"🔍 ffprobe path: {ffprobe_path} => {os.path.exists(ffprobe_path)}")


# ========================
# 🧹 Hàm tiện ích
# ========================
def sanitize_filename(name: str) -> str:
    """Loại bỏ ký tự đặc biệt và thay khoảng trắng bằng '-'"""
    name = re.sub(r'[\\/*?:"<>|]', "", name)
    name = re.sub(r"\s+", "-", name.strip())
    return name

def default_log(msg):
    print(msg)

# ========================
# ✂️ Hàm cắt im lặng
# ========================
def trim_silence(audio_path: str, log_func=None, silence_thresh: int = -40, min_silence_len: int = 1000):
    log_func = log_func or default_log
    log_func("✂️ Đang loại bỏ đoạn im lặng...")
    sound = AudioSegment.from_file(audio_path, format="mp3")

    nonsilent_ranges = silence.detect_nonsilent(
        sound, min_silence_len=min_silence_len, silence_thresh=silence_thresh
    )

    if not nonsilent_ranges:
        log_func("⚠️ Không phát hiện được đoạn có tiếng, giữ nguyên audio gốc.")
        return audio_path

    start_trim = nonsilent_ranges[0][0]
    end_trim = nonsilent_ranges[-1][1]

    trimmed = sound[start_trim:end_trim]
    trimmed_path = str(Path(audio_path).with_name("trimmed_" + Path(audio_path).name))
    trimmed.export(trimmed_path, format="mp3")
    log_func(f"✅ Audio sau khi cắt im lặng: {trimmed_path}")
    return trimmed_path

# ========================
# 🎧 Tải audio từ YouTube
# ========================
def download_audio(url: str, log_func=None):
    log_func = log_func or default_log
    log_func("🔽 Đang tải audio từ video...")

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    ydl_opts = {
        "format": "bestaudio/best",
        "postprocessors": [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"}
        ],
        "outtmpl": f"{OUTPUT_DIR}/%(id)s.%(ext)s",
        "restrictfilenames": True,
        "quiet": True,
        "noplaylist": True,
        "ignoreerrors": True,
        "playlistend": 1,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        video_id = info["id"]
        title = sanitize_filename(info["title"])

        downloaded_files = list(Path(OUTPUT_DIR).glob(f"{video_id}.*"))
        if not downloaded_files:
            raise FileNotFoundError("Không tìm thấy file audio sau khi tải!")

        audio_file = downloaded_files[0]
        new_name = f"{OUTPUT_DIR}/{title}.mp3"
        os.rename(audio_file, new_name)
        log_func(f"✅ Audio đã lưu tại: {new_name}")
        return title, new_name

# ========================
# 🧠 Chuyển giọng nói → text
# ========================
def transcribe_audio(audio_path: str, model_name='base', log_func=None):
    import whisper
    import sys
    from pathlib import Path

    log_func = log_func or print
    log_func(f"🎧 Đường dẫn audio: {audio_path}")
    log_func(f"🛠️ Sử dụng model Whisper: {model_name}")
    
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Không tìm thấy file: {audio_path}")

    log_func("🧠 Đang xử lý âm thanh (speech-to-text)...")

    # =============================
    # 🔧 Xử lý cache model riêng
    # =============================
    cache_dir = os.path.expanduser("~/.cache/whisper")
    os.makedirs(cache_dir, exist_ok=True)

    # Nếu đang chạy trong môi trường PyInstaller, override đường dẫn mặc định
    if getattr(sys, "frozen", False):
        import whisper._download as _download
        import whisper.utils as _utils
        _download._MODELS_DIR = cache_dir
        _utils._MODELS_DIR = cache_dir

    log_func(f"📂 Model cache: {cache_dir}")

    # =============================
    # Load model (Whisper sẽ tự tải nếu chưa có)
    # =============================
    model = whisper.load_model(model_name, download_root=cache_dir)

    # =============================
    # Transcribe
    # =============================
    result = model.transcribe(audio_path)

    lines = []
    for seg in result.get("segments", []):
        start = seg.get("start", 0)
        end = seg.get("end", 0)
        text = seg.get("text", "").strip()
        lines.append(f"[{start:6.1f} → {end:6.1f}] {text}")

    if not lines:
        lines = [result.get("text", "").strip()]

    text_file = Path(audio_path).with_suffix(".txt")
    with open(text_file, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    log_func(f"📜 Kết quả đã lưu tại: {text_file}")
    return "\n".join(lines)



if __name__ == "__main__":
    
    audio_path = os.path.join(OUTPUT_DIR, "ANH-ĐÃ-LÀM-GÌ-ĐÂU---Nhật-Hoàng-ft.-Thùy-Chi-tự-sự-câu-chuyện-thăng-trầm-của-cuộc-sống-Rap-Việt-2024", 'trimmed_ANH-ĐÃ-LÀM-GÌ-ĐÂU---Nhật-Hoàng-ft.-Thùy-Chi-tự-sự-câu-chuyện-thăng-trầm-của-cuộc-sống-Rap-Việt-2024.mp3')
    transcribe_audio(audio_path, 'base')
