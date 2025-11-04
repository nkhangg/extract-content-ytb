// File validation helper
export const validateFile = (file: File) => {
  const maxSize = 2 * 1024 * 1024; // 2MB
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (file.size > maxSize) {
    return "Kích thước file phải nhỏ hơn 2MB";
  }

  if (!allowedTypes.includes(file.type)) {
    return "Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)";
  }

  return null;
};
