import type { GrammarCorrection } from "@/types/domain";

export function detectBasicGrammarCorrection(
  sentence: string,
): GrammarCorrection | null {
  const normalized = sentence.trim();

  if (!normalized) {
    return null;
  }

  const lower = normalized.toLowerCase();

  if (lower.includes("since last week") && lower.includes("i will work")) {
    return {
      original: normalized,
      corrected: normalized.replace(
        /i will work/i,
        "I have been working",
      ),
      explanation:
        "Karena aktivitas sudah dimulai di masa lalu dan berlanjut sampai sekarang, gunakan present perfect continuous.",
    };
  }

  if (lower.includes("yesterday") && /\bi go\b/i.test(normalized)) {
    return {
      original: normalized,
      corrected: normalized.replace(/\bi go\b/i, "I went"),
      explanation:
        "Jika ada kata waktu masa lalu seperti yesterday, kata kerjanya perlu berubah ke bentuk past tense.",
    };
  }

  if (/\bi am agree\b/i.test(normalized)) {
    return {
      original: normalized,
      corrected: normalized.replace(/\bi am agree\b/i, "I agree"),
      explanation:
        "Kata agree adalah verb, jadi tidak perlu didahului oleh be verb am.",
    };
  }

  return null;
}

export function buildAssistantReply(
  sentence: string,
  correction: GrammarCorrection | null,
): string {
  if (correction) {
    return "Kalimatmu sudah jelas. Koreksi kecil sudah muncul di panel agar kamu bisa langsung lanjut bicara dengan percaya diri.";
  }

  if (sentence.length < 20) {
    return "Bagus. Coba lanjutkan dengan detail tambahan seperti tempat, waktu, atau alasan supaya jawabanmu makin natural.";
  }

  return "Struktur kalimatmu sudah rapi. Sekarang coba tambah satu kalimat lanjutan untuk memperpanjang conversation.";
}
