"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ScriptMode = "ai" | "custom";
type Duration = "30s" | "1min" | "2min" | "3min";
type VoiceOption = "female" | "male";
type Background =
  | "midnight"
  | "aurora"
  | "ember"
  | "forest"
  | "slate"
  | "void";

const backgrounds: { id: Background; name: string; gradient: string }[] = [
  {
    id: "midnight",
    name: "Midnight",
    gradient: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
  },
  {
    id: "aurora",
    name: "Aurora",
    gradient: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
  },
  {
    id: "ember",
    name: "Ember",
    gradient: "linear-gradient(135deg, #1a0000, #3d0000, #7f0000)",
  },
  {
    id: "forest",
    name: "Forest",
    gradient: "linear-gradient(135deg, #000000, #0f3443, #1a4a2e)",
  },
  {
    id: "slate",
    name: "Slate",
    gradient: "linear-gradient(135deg, #1c1c2e, #2d2d44, #1a1a2e)",
  },
  {
    id: "void",
    name: "Void",
    gradient: "linear-gradient(135deg, #000000, #0a0a0a, #111111)",
  },
];

const durationMap: Record<Duration, string> = {
  "30s": "30s",
  "1min": "1 min",
  "2min": "2 min",
  "3min": "3 min",
};

export default function GeneratePage() {
  const router = useRouter();
  const [repoUrl, setRepoUrl] = useState("");
  const [scriptMode, setScriptMode] = useState<ScriptMode>("ai");
  const [customScript, setCustomScript] = useState("");
  const [duration, setDuration] = useState<Duration>("30s");
  const [voiceOption, setVoiceOption] = useState<VoiceOption>("female");
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [selectedBackground, setSelectedBackground] =
    useState<Background>("midnight");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repo URL");
      return;
    }

    setError("");
    setIsLoading(true);
    setLoadingMessage("Analyzing your repo...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoUrl,
          scriptMode,
          customScript,
          duration: durationMap[duration],
          background: selectedBackground,
          voice: voiceOption,
        }),
      });

      setLoadingMessage("Rendering your video...");

      const data = await response.json();

      if (data.success) {
        setLoadingMessage("Almost done...");

        const videoDataUrl = `data:video/mp4;base64,${data.data.videoBase64}`;

        try {
          sessionStorage.setItem("demofy_video_url", videoDataUrl);
          sessionStorage.setItem(
            "demofy_slides",
            JSON.stringify(data.data.slides)
          );
          sessionStorage.setItem("demofy_repo", data.data.repo);
          sessionStorage.setItem("demofy_background", selectedBackground);
        } catch (e) {
          console.error("Storage error:", e);
        }

        router.push("/result");
      } else {
        setError(data.error || "Something went wrong");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#09090b" }}>
      <header
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-8"
        style={{ borderBottom: "1px solid #1e1e2e" }}
      >
        <span className="text-lg font-bold" style={{ color: "#fafafa" }}>
          Demofy
        </span>
        <Link
          href="/"
          className="text-sm transition-colors hover:opacity-80"
          style={{ color: "#71717a" }}
        >
          Back to home
        </Link>
      </header>

      <main className="mx-auto max-w-[640px] px-8 py-12">
        <h1
          className="mb-2 text-2xl font-semibold"
          style={{ color: "#fafafa" }}
        >
          Generate your demo
        </h1>
        <p className="mb-8 text-sm" style={{ color: "#71717a" }}>
          Fill in the details below and we'll handle the rest.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 p-8"
          style={{
            backgroundColor: "#111117",
            border: "1px solid #1e1e2e",
            borderRadius: "12px",
          }}
        >
          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: "#71717a" }}
            >
              GitHub repository
            </label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                if (error) setError("");
              }}
              placeholder="https://github.com/username/repo"
              className="h-11 w-full px-4 text-sm outline-none transition-colors"
              style={{
                backgroundColor: "#09090b",
                border: error ? "1px solid #ef4444" : "1px solid #1e1e2e",
                borderRadius: "8px",
                color: "#fafafa",
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = "#4f46e5";
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = "#1e1e2e";
              }}
            />
            {error && (
              <p className="mt-2 text-xs" style={{ color: "#ef4444" }}>
                {error}
              </p>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: "#71717a" }}
            >
              Script
            </label>
            <div className="flex gap-2">
              {(["ai", "custom"] as ScriptMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setScriptMode(mode)}
                  className="px-4 py-1.5 text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor:
                      scriptMode === mode ? "#4f46e5" : "transparent",
                    border:
                      scriptMode === mode ? "none" : "1px solid #1e1e2e",
                    borderRadius: "9999px",
                    color: scriptMode === mode ? "#ffffff" : "#71717a",
                  }}
                >
                  {mode === "ai" ? "AI writes it" : "I'll write my own"}
                </button>
              ))}
            </div>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: scriptMode === "custom" ? "160px" : "0px",
                opacity: scriptMode === "custom" ? 1 : 0,
                marginTop: scriptMode === "custom" ? "12px" : "0px",
              }}
            >
              <textarea
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                placeholder="Write your demo script here..."
                className="h-[120px] w-full resize-none p-4 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "#09090b",
                  border: "1px solid #1e1e2e",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.target.style.borderColor = "#1e1e2e")}
              />
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: "#71717a" }}
            >
              Duration
            </label>
            <div className="flex gap-2">
              {(["30s", "1min", "2min", "3min"] as Duration[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDuration(d)}
                  className="px-4 py-1.5 text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor:
                      duration === d ? "#4f46e5" : "transparent",
                    border: duration === d ? "none" : "1px solid #1e1e2e",
                    borderRadius: "9999px",
                    color: duration === d ? "#ffffff" : "#71717a",
                  }}
                >
                  {d === "1min"
                    ? "1 min"
                    : d === "2min"
                      ? "2 min"
                      : d === "3min"
                        ? "3 min"
                        : "30s"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: "#71717a" }}
            >
              Voice
            </label>
            <div className="flex gap-2">
              {(["female", "male"] as VoiceOption[]).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVoiceOption(v)}
                  className="px-4 py-1.5 text-[13px] font-medium capitalize transition-colors"
                  style={{
                    backgroundColor:
                      voiceOption === v ? "#4f46e5" : "transparent",
                    border: voiceOption === v ? "none" : "1px solid #1e1e2e",
                    borderRadius: "9999px",
                    color: voiceOption === v ? "#ffffff" : "#71717a",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: "#71717a" }}
            >
              Screenshots
            </label>
            <p className="mb-2 text-xs" style={{ color: "#71717a" }}>
              Upload screenshots of your app. They'll appear in your video.
            </p>
            {screenshots.length < 10 && (
              <label
                className="flex cursor-pointer flex-col items-center justify-center p-6"
                style={{
                  backgroundColor: "#09090b",
                  border: "1px dashed #1e1e2e",
                  borderRadius: "8px",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#71717a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span className="mt-2 text-sm" style={{ color: "#71717a" }}>
                  Drop screenshots here or click to browse
                </span>
                <span className="mt-1 text-xs" style={{ color: "#71717a" }}>
                  PNG or JPG, up to 10 files
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const remaining = 10 - screenshots.length;
                    const newFiles = files.slice(0, remaining);
                    setScreenshots((prev) => [...prev, ...newFiles]);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
            {screenshots.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {screenshots.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Screenshot ${index + 1}`}
                      className="object-cover"
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setScreenshots((prev) =>
                          prev.filter((_, i) => i !== index)
                        )
                      }
                      className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center text-xs"
                      style={{
                        backgroundColor: "#1e1e2e",
                        borderRadius: "9999px",
                        color: "#fafafa",
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label
              className="mb-2 block text-[13px] font-medium"
              style={{ color: "#71717a" }}
            >
              Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {backgrounds.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setSelectedBackground(bg.id)}
                  className="flex flex-col items-center"
                >
                  <div
                    className="w-full transition-all"
                    style={{
                      height: "72px",
                      borderRadius: "8px",
                      background: bg.gradient,
                      border:
                        selectedBackground === bg.id
                          ? "2px solid #4f46e5"
                          : bg.id === "void"
                            ? "1px solid #27272a"
                            : "1px solid #1e1e2e",
                    }}
                  />
                  <span
                    className="mt-1 text-xs"
                    style={{ color: "#71717a" }}
                  >
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 text-base font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            style={{
              backgroundColor: isLoading ? "#4338ca" : "#4f46e5",
              borderRadius: "8px",
              color: "#ffffff",
            }}
            onMouseEnter={(e) => {
              if (!isLoading)
                e.currentTarget.style.backgroundColor = "#4338ca";
            }}
            onMouseLeave={(e) => {
              if (!isLoading)
                e.currentTarget.style.backgroundColor = "#4f46e5";
            }}
          >
            {isLoading ? (
              <>
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {loadingMessage || "Generating your video..."}
              </>
            ) : (
              "Generate my demo video"
            )}
          </button>
        </form>
      </main>
    </div>
  );
}