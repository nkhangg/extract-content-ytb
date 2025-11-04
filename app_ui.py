import sys
import os
import shutil
import subprocess
from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QTextEdit, QTreeView,
    QComboBox, QMenu, QMessageBox
)
from PyQt6.QtGui import QFileSystemModel, QFont
from PyQt6.QtCore import QDir, Qt, QPoint, QThread, pyqtSignal, QTimer
from video_to_text import download_audio, trim_silence, transcribe_audio, OUTPUT_DIR


# ==========================
# Worker Thread để xử lý download + trim + transcribe
# ==========================
class Worker(QThread):
    log_signal = pyqtSignal(str)
    finished_signal = pyqtSignal(str)

    def __init__(self, link: str, model: str):
        super().__init__()
        self.link = link
        self.model = model

    def run(self):
        try:
            self.log(f"🔽 Nhận link: {self.link}")

            # 1️⃣ Download audio
            title, audio_file = download_audio(self.link, log_func=self.log)

            # 2️⃣ Tạo folder theo tên video
            video_folder = os.path.join(OUTPUT_DIR, title)
            os.makedirs(video_folder, exist_ok=True)

            # 3️⃣ Di chuyển audio vào folder
            audio_dest = os.path.join(video_folder, os.path.basename(audio_file))
            shutil.move(audio_file, audio_dest)
            self.log(f"✅ Đã di chuyển audio vào folder: {video_folder}")

            # # 4️⃣ Cắt im lặng (tùy chọn)
            # trimmed_audio = trim_silence(audio_dest, log_func=self.log)
            # self.log(f"✅ Đã cắt im lặng: {trimmed_audio}")

            # 5️⃣ Transcribe audio
            transcribe_audio(audio_dest, model_name=self.model, log_func=self.log)

            # ✅ Hoàn tất
            self.finished_signal.emit(video_folder)
        except Exception as e:
            self.log(f"❌ Lỗi: {e}")
            # ✅ Báo về UI để clear trạng thái loading
            self.finished_signal.emit("")

    def log(self, message: str):
        self.log_signal.emit(message)


# ==========================
# UI chính
# ==========================
class AppUI(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("YouTube Audio Downloader")
        self.setGeometry(0, 0, 900, 600)
        self.center()
        self.setup_ui()
        self.worker = None
        self.loading_timer = None
        self.loading_dots = 0

    def center(self):
        frameGm = self.frameGeometry()
        screen = QApplication.primaryScreen()
        centerPoint = screen.availableGeometry().center()
        frameGm.moveCenter(centerPoint)
        self.move(frameGm.topLeft())

    def setup_ui(self):
        layout = QVBoxLayout()

        # Input link
        input_layout = QHBoxLayout()
        input_label = QLabel("YouTube link:")
        input_label.setFont(QFont("Arial", 12))
        self.input_edit = QLineEdit()
        self.input_edit.setFont(QFont("Arial", 12))
        self.input_edit.setPlaceholderText("Nhập link YouTube...")
        input_layout.addWidget(input_label)
        input_layout.addWidget(self.input_edit)
        layout.addLayout(input_layout)

        # Model selection dropdown
        model_layout = QHBoxLayout()
        model_label = QLabel("Select Model:")
        model_label.setFont(QFont("Arial", 12))
        self.model_combo = QComboBox()
        self.model_combo.setFont(QFont("Arial", 12))
        self.model_combo.addItems([
            "tiny",
            "base",
            "small",
            "medium",
            "large",
            "large-v2",
            "large-v3"
        ])
        model_layout.addWidget(model_label)
        model_layout.addWidget(self.model_combo)
        layout.addLayout(model_layout)

        # Process button
        self.process_btn = QPushButton("Process")
        self.process_btn.setFont(QFont("Arial", 12))
        self.process_btn.clicked.connect(self.start_process)
        layout.addWidget(self.process_btn)

        # Log area
        layout.addWidget(QLabel("Log:"))
        self.log_area = QTextEdit()
        self.log_area.setFont(QFont("Courier", 11))
        self.log_area.setReadOnly(True)
        layout.addWidget(self.log_area)

        # Folder tree
        layout.addWidget(QLabel("Folder downloads:"))
        self.tree_view = QTreeView()
        self.tree_view.setFont(QFont("Arial", 11))
        self.model = QFileSystemModel()
        self.model.setRootPath(os.path.abspath(OUTPUT_DIR))
        self.model.setFilter(QDir.Filter.AllDirs | QDir.Filter.Files | QDir.Filter.NoDotAndDotDot)
        self.tree_view.setModel(self.model)
        self.tree_view.setRootIndex(self.model.index(os.path.abspath(OUTPUT_DIR)))
        self.tree_view.setColumnWidth(0, 500)
        self.tree_view.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
        self.tree_view.customContextMenuRequested.connect(self.show_context_menu)
        layout.addWidget(self.tree_view)

        self.setLayout(layout)

    # ======================
    # Loading animation cho nút
    # ======================
    def start_loading_animation(self):
        self.loading_dots = 0
        self.loading_timer = QTimer(self)
        self.loading_timer.timeout.connect(self.update_loading_text)
        self.loading_timer.start(500)

    def stop_loading_animation(self):
        if self.loading_timer:
            self.loading_timer.stop()
            self.loading_timer = None
        self.process_btn.setText("Process")

    def update_loading_text(self):
        dots = "." * (self.loading_dots % 4)
        self.process_btn.setText(f"⏳ Đang xử lý{dots}")
        self.loading_dots += 1

    # ======================
    # Process logic
    # ======================
    def start_process(self):
        link = self.input_edit.text().strip()
        if not link:
            self.log("⚠️ Chưa nhập link YouTube!")
            return

        # Clear log lần nhấn mới
        self.log_area.clear()

        model_name = self.model_combo.currentText()

        # Disable nút Process và dropdown, hiển thị trạng thái
        self.process_btn.setEnabled(False)
        self.model_combo.setEnabled(False)

        # Bắt đầu hiệu ứng loading
        self.start_loading_animation()

        self.worker = Worker(link, model_name)
        self.worker.log_signal.connect(self.log)
        self.worker.finished_signal.connect(self.process_finished)
        self.worker.start()
        self.log("🟢 Bắt đầu xử lý...")

    def process_finished(self, folder):
        self.stop_loading_animation()
        self.process_btn.setEnabled(True)
        self.model_combo.setEnabled(True)

        if folder:
            self.log(f"🎉 Hoàn tất! Dữ liệu nằm trong folder:\n{folder}")
        else:
            self.log("⚠️ Quá trình bị lỗi hoặc không hoàn tất.")
            QMessageBox.critical(self, "Error", "Quá trình xử lý gặp lỗi! Xem log để biết chi tiết.")

    def log(self, message: str):
        self.log_area.append(message)
        self.log_area.ensureCursorVisible()

    # ======================
    # Context menu tree view
    # ======================
    def show_context_menu(self, pos: QPoint):
        index = self.tree_view.indexAt(pos)
        if not index.isValid():
            return
        file_path = self.model.filePath(index)

        menu = QMenu()
        if os.path.isdir(file_path):
            open_folder_action = menu.addAction("Open Folder")
            delete_action = menu.addAction("Delete")
        else:
            open_folder_action = menu.addAction("Open Folder")
            open_file_action = menu.addAction("Open File")
            delete_action = menu.addAction("Delete")

        action = menu.exec(self.tree_view.viewport().mapToGlobal(pos))
        if action is None:
            return

        try:
            if os.path.isdir(file_path):
                if action == open_folder_action:
                    self.open_path(file_path)
                elif action == delete_action:
                    reply = QMessageBox.question(
                        self, "Confirm Delete",
                        f"Bạn có chắc muốn xóa folder:\n{file_path}?",
                        QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
                    )
                    if reply == QMessageBox.StandardButton.Yes:
                        shutil.rmtree(file_path)
            else:
                if action == open_folder_action:
                    self.open_path(os.path.dirname(file_path))
                elif action == open_file_action:
                    self.open_path(file_path)
                elif action == delete_action:
                    reply = QMessageBox.question(
                        self, "Confirm Delete",
                        f"Bạn có chắc muốn xóa file:\n{file_path}?",
                        QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
                    )
                    if reply == QMessageBox.StandardButton.Yes:
                        os.remove(file_path)
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Lỗi: {e}")

    def open_path(self, path: str):
        """Mở file hoặc folder tùy OS"""
        if sys.platform.startswith("win"):
            os.startfile(path)
        elif sys.platform.startswith("darwin"):
            subprocess.run(["open", path])
        else:
            subprocess.run(["xdg-open", path])


if __name__ == "__main__":
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
    app = QApplication(sys.argv)
    window = AppUI()
    window.show()
    sys.exit(app.exec())
