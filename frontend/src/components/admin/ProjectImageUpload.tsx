
"use client";

import { useRef, useState } from "react";
import axios from "axios";
import {
  ImagePlus,
  Upload,
  Loader2,
  CheckCircle2,
  X,
} from "lucide-react";

import { api } from "@/lib/api";

interface UploadResponse {
  message: string;
  image: {
    path: string;
    url: string;
    name: string;
    size: number;
  };
}

interface ProjectImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const MAX_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function ProjectImageUpload({
  value,
  onChange,
}: ProjectImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleUpload(file: File | undefined) {
    if (!file || uploading) return;

    setError("");
    setSuccess("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Format accepté: JPG, PNG ou WebP.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Image trop volumineuse. Maximum 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);

    try {
      const response = await api.post<UploadResponse>(
        "/api/admin/media/upload",
        formData
      );

      onChange(response.data.image.url);
      setSuccess("Image téléchargée avec succès.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 413) {
          setError("Fichier trop volumineux pour le serveur.");
        } else if (err.response?.status === 419) {
          setError("Session expirée. Actualisez la page.");
        } else if (err.response?.status === 422) {
          setError("Image refusée par la validation.");
        } else {
          setError("Impossible d'envoyer l'image.");
        }
      } else {
        setError("Une erreur est survenue.");
      }
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm text-gray-300">
        Cover Image
      </label>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(event) =>
          void handleUpload(event.target.files?.[0])
        }
        className="sr-only"
        aria-label="Upload project image"
      />

      {value ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B12]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Project cover preview"
            className="h-52 w-full object-contain"
          />

          <div className="flex items-center justify-between gap-3 border-t border-white/10 p-3">
            <span className="truncate text-xs text-gray-400">
              {value.split("/").pop()}
            </span>

            <button
              type="button"
              onClick={() => {
                onChange("");
                setSuccess("");
              }}
              disabled={uploading}
              aria-label="Remove selected cover"
              className="rounded-lg p-2 text-red-400 transition hover:bg-red-500/10"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#00C8C8]/30 bg-[#0B0B12] p-6 text-center">
          <ImagePlus
            size={36}
            className="mb-3 text-[#00C8C8]"
          />

          <p className="text-sm text-gray-300">
            Ajoutez une image de couverture
          </p>

          <p className="mt-2 text-xs text-gray-500">
            JPG, PNG, WebP — Max 5 MB
          </p>
        </div>
      )}

      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#00C8C8]/30 bg-[#00C8C8]/10 px-5 py-3 text-sm font-medium text-[#00C8C8] transition hover:bg-[#00C8C8]/20 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Upload en cours...
          </>
        ) : (
          <>
            <Upload size={18} />
            {value ? "Changer l'image" : "Upload Image"}
          </>
        )}
      </button>

      {success && (
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-emerald-400"
        >
          <CheckCircle2 size={17} />
          {success}
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
