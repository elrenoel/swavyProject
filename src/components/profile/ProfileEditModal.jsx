import { useEffect, useMemo, useRef, useState } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const getCircularCropDataUrl = (cropper, size) => {
  const canvas = cropper.getCroppedCanvas({
    width: size,
    height: size,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high",
  });

  const output = document.createElement("canvas");
  output.width = size;
  output.height = size;
  const ctx = output.getContext("2d");

  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(canvas, 0, 0, size, size);

  return output.toDataURL("image/png");
};

const ProfileEditModal = ({ profile, onClose, onSave }) => {
  const [username, setUsername] = useState(profile?.username || "");
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarSource, setAvatarSource] = useState("");
  const [rotation, setRotation] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const cropperRef = useRef(null);

  useEffect(() => {
    setUsername(profile?.username || "");
    setFullName(profile?.full_name || "");
    setAvatarFile(null);
    setAvatarSource("");
    setRotation(0);
  }, [profile]);

  const previewUrl = useMemo(() => {
    if (!avatarFile) {
      if (!profile?.avatar_url) return "";
      if (!profile?.updated_at) return profile.avatar_url;
      return `${profile.avatar_url}?t=${new Date(profile.updated_at).getTime()}`;
    }
    return URL.createObjectURL(avatarFile);
  }, [avatarFile, profile?.avatar_url, profile?.updated_at]);

  useEffect(() => {
    return () => {
      if (avatarFile) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [avatarFile, previewUrl]);

  useEffect(() => {
    if (!avatarFile) {
      setAvatarSource("");
      return;
    }

    let mounted = true;
    readFileAsDataUrl(avatarFile).then((dataUrl) => {
      if (mounted) setAvatarSource(dataUrl);
    });

    return () => {
      mounted = false;
    };
  }, [avatarFile]);

  useEffect(() => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      cropper.rotateTo(rotation);
    }
  }, [rotation]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      let avatarDataUrl = null;
      if (avatarFile && cropperRef.current?.cropper) {
        avatarDataUrl = getCircularCropDataUrl(cropperRef.current.cropper, 512);
      }

      await onSave({
        username: username.trim(),
        full_name: fullName.trim(),
        avatarDataUrl,
      });

      onClose();
    } catch (err) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          <button
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={previewUrl || "https://i.pravatar.cc/120"}
              className="h-16 w-16 rounded-full object-cover"
            />
            <div>
              <label className="block text-xs text-gray-500">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setAvatarFile(event.target.files?.[0])}
                className="text-xs"
              />
            </div>
          </div>

          {avatarSource ? (
            <div className="space-y-3">
              <div className="avatar-cropper overflow-hidden rounded-2xl border">
                <Cropper
                  src={avatarSource}
                  style={{ height: 260, width: "100%" }}
                  aspectRatio={1}
                  viewMode={1}
                  dragMode="move"
                  background={false}
                  responsive={true}
                  autoCropArea={1}
                  guides={false}
                  center={true}
                  cropBoxMovable={false}
                  cropBoxResizable={false}
                  toggleDragModeOnDblclick={false}
                  ref={cropperRef}
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs text-gray-500">Rotate</label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  value={rotation}
                  onChange={(event) => setRotation(Number(event.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          ) : null}

          <div>
            <label className="block text-xs text-gray-500">Display Name</label>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="Display name"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500">Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              placeholder="username"
            />
          </div>

          {error ? <p className="text-xs text-red-500">{error}</p> : null}

          <button
            type="submit"
            disabled={isSaving}
            className="w-full rounded-full bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;
