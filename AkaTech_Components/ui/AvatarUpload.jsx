import React, { useState, useRef } from "react";
import { Icons } from "./Icons";
import { Avatar } from "./Avatar";

export const AvatarUpload = ({
  currentAvatar,
  userName,
  onUpload,
  onGoogleSync,
  onRemove,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    // Validation
    const validTypes = ["image/jpeg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a JPG or PNG image.");
      setIsUploading(false);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      setIsUploading(false);
      return;
    }

    try {
      // Resize Image
      const resizedImage = await resizeImage(file);
      await onUpload(resizedImage);
    } catch (err) {
      setError("Failed to process image.");
    } finally {
      setIsUploading(false);
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        // Standard dimension 128x128
        const size = 128;
        canvas.width = size;
        canvas.height = size;

        // Calculate aspect ratio to crop center
        const ratio = Math.max(size / img.width, size / img.height);
        const centerShift_x = (size - img.width * ratio) / 2;
        const centerShift_y = (size - img.height * ratio) / 2;

        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(
          img,
          0,
          0,
          img.width,
          img.height,
          centerShift_x,
          centerShift_y,
          img.width * ratio,
          img.height * ratio
        );

        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = reject;
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar
          src={currentAvatar}
          fallback={userName}
          size="xl"
          className="border-4 border-white dark:border-akatech-card shadow-lg"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 p-2 bg-akatech-gold text-white rounded-full shadow-lg hover:bg-akatech-goldDark transition-colors"
          title="Upload Photo"
        >
          <Icons.Camera className="w-5 h-5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg, image/png"
          onChange={handleFileChange}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onGoogleSync}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/20 transition-colors"
        >
          <Icons.User className="w-4 h-4" />
          Sync Google
        </button>
        {currentAvatar && (
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-500/20 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
          >
            <Icons.Trash className="w-4 h-4" />
            Remove
          </button>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">
        JPG or PNG, max 2MB.
      </p>
    </div>
  );
};
