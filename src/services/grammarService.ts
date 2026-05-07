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

  const advancedReplacements: Array<{
    pattern: RegExp;
    replacement: string;
    explanation: string;
  }> = [
    {
      pattern: /\bi have many portfolio\b/i,
      replacement: "I have many portfolios",
      explanation:
        "Setelah many, noun countable perlu bentuk jamak, jadi portfolio menjadi portfolios.",
    },
    {
      pattern: /\bmain focus is built\b/i,
      replacement: "main focus is building",
      explanation:
        "Setelah is untuk aktivitas umum, bentuk yang natural biasanya gerund: building.",
    },
    {
      pattern: /\bi was built\b/i,
      replacement: "I built",
      explanation:
        "Untuk menjelaskan aksi yang kamu lakukan sendiri, gunakan active voice: I built.",
    },
    {
      pattern: /\bwhich is gave me\b/i,
      replacement: "which gives me",
      explanation:
        "Setelah which, gunakan present tense yang konsisten: gives, bukan is gave.",
    },
    {
      pattern: /\bfix income\b/i,
      replacement: "fixed income",
      explanation:
        "Dalam konteks ini bentuk adjective yang tepat adalah fixed income.",
    },
  ];

  for (const item of advancedReplacements) {
    if (item.pattern.test(normalized)) {
      return {
        original: normalized,
        corrected: normalized.replace(item.pattern, item.replacement),
        explanation: item.explanation,
      };
    }
  }

  if (/\bi\b/.test(normalized)) {
    const corrected = normalized
      .replace(/\bi\b/g, "I")
      .replace(/^\s*([a-z])/, (_, letter: string) => letter.toUpperCase());

    if (corrected !== normalized) {
      return {
        original: normalized,
        corrected,
        explanation:
          "Pronoun I perlu huruf kapital. Kalimat juga lebih natural jika diawali huruf kapital.",
      };
    }
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
