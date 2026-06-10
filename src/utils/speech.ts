export function stopAllSpeech(): void {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

export function speakFrench(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
    rate?: number;
    pitch?: number;
  }
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    if (options?.onError) options.onError("Speech synthesis not supported in this environment.");
    return;
  }

  // Cancel any ongoing speech first to avoid queue bottlenecks
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "fr-FR";
  utterance.rate = options?.rate ?? 0.85; // Slightly slower for French comprehension practice
  utterance.pitch = options?.pitch ?? 1.0;

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  // Retrieve list of available voices and bind the French voice
  const voices = window.speechSynthesis.getVoices();
  const frenchVoice =
    voices.find((v) => v.lang.startsWith("fr-FR") || v.lang.startsWith("fr")) ||
    voices.find((v) => v.lang.startsWith("en-US") || v.lang.startsWith("en")); // fallback if French voice is absent on client OS

  if (frenchVoice) {
    utterance.voice = frenchVoice;
  }

  // Handle Chrome's voice load latency
  window.speechSynthesis.speak(utterance);
}

export function getAvailableFrenchVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices().filter((v) => v.lang.startsWith("fr"));
}
