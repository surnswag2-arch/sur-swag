import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { X, Music, Camera, Upload, Loader2 } from "lucide-react";
import { requestUpload, uploadFile, confirmUpload } from "../api/upload";
import { showApiError } from "../api/client";

export default function UploadPage() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState<"camera" | "gallery">("camera");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [streamReady, setStreamReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedTab("gallery");

    // Auto-play the preview
    if (videoPreviewRef.current) {
      videoPreviewRef.current.src = url;
    }
  };

  const handleCameraClick = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1080 }, height: { ideal: 1920 } },
        audio: true,
      });
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
      setStreamReady(true);
    } catch {
      // Camera not available or permission denied, fallback to gallery
      fileInputRef.current?.click();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showApiError(new Error("কোনো ভিডিও সিলেক্ট করা হয়নি"));
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Request upload URL
      const { uploadUrl, videoId } = await requestUpload(selectedFile.type, 0);

      // Step 2: Upload file to R2
      setUploadProgress(30);
      await uploadFile(uploadUrl, selectedFile, (percent) => {
        setUploadProgress(30 + Math.round(percent * 0.4));
      });

      // Step 3: Confirm upload
      setUploadProgress(80);
      await confirmUpload(videoId, {
        caption: caption || undefined,
        privacy: "public",
      });

      setUploadProgress(100);
      // Navigate back to feed
      setTimeout(() => navigate("/", { replace: true }), 500);
    } catch (err) {
      showApiError(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="h-full w-full bg-bg-base flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 active:bg-white/20 transition-all"
        >
          <X className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-base font-bold font-display">আপলোড</h1>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent-primary text-white text-xs font-semibold active:opacity-90 transition-all disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              {uploadProgress}%
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              আপলোড
            </>
          )}
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 mx-4 rounded-3xl bg-black relative overflow-hidden">
        {previewUrl || streamReady ? (
          <video
            ref={videoPreviewRef}
            className="h-full w-full object-cover"
            loop
            playsInline
            muted
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#0b0b0f] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full bg-white/[0.06] flex items-center justify-center">
                <Camera className="w-10 h-10 text-white/30" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-white/30 font-medium">ক্যামেরা খুলতে ট্যাপ করুন</p>
            </div>
          </div>
        )}

        {/* Tab selector */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl rounded-full p-1 flex gap-1">
          <button
            onClick={handleCameraClick}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedTab === "camera"
                ? "bg-text-primary text-bg-base"
                : "text-white/60"
            }`}
          >
            ক্যামেরা
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedTab === "gallery"
                ? "bg-text-primary text-bg-base"
                : "text-white/60"
            }`}
          >
            গ্যালারি
          </button>
        </div>

        {/* Flash/settings buttons (UI only) */}
        <button className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <span className="text-sm">⚡</span>
        </button>
        <button className="absolute top-6 left-6 flex flex-col gap-0.5 items-center">
          <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <Music className="w-4 h-4 text-white" />
          </div>
          <span className="text-[9px] text-white/60 mt-0.5">সাউন্ড</span>
        </button>

        {/* Upload progress */}
        {uploading && (
          <div className="absolute bottom-20 left-4 right-4">
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-primary rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Caption input */}
      {selectedFile && (
        <div className="px-4 py-3">
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="ক্যাপশন লিখুন..."
            className="w-full h-10 px-4 rounded-xl bg-white/10 text-text-primary text-sm placeholder:text-white/30 border border-white/10 outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all"
          />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Record button (only when no file selected) */}
      {!selectedFile && !streamReady && (
        <div className="flex items-center justify-center py-6">
          <button
            onClick={handleCameraClick}
            className="relative"
          >
            <div className="w-20 h-20 rounded-full border-[4px] border-white/30 flex items-center justify-center animate-shutter">
              <div className="w-16 h-16 rounded-full bg-accent-primary active:scale-90 transition-transform cursor-pointer" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
