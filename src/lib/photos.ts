// Fotos da família: categorias e limites (compartilhado entre servidor e navegador).
export const PHOTO_CATEGORIES = [
  { value: "casa", label: "Atividade em casa", emoji: "🏠" },
  { value: "comportamento", label: "Comportamento", emoji: "🧩" },
  { value: "alimentacao", label: "Alimentação", emoji: "🍽️" },
  { value: "sono", label: "Sono", emoji: "🌙" },
  { value: "escola", label: "Escola", emoji: "🏫" },
  { value: "conquista", label: "Conquista", emoji: "🏅" },
  { value: "comunicacao", label: "Comunicação", emoji: "🗣️" },
  { value: "outro", label: "Outro", emoji: "📷" },
];
export const photoCategory = (v: string) => PHOTO_CATEGORIES.find((c) => c.value === v) ?? PHOTO_CATEGORIES[PHOTO_CATEGORIES.length - 1];
export const PHOTO_MAX_SIDE = 1600; // px, a foto é reduzida no aparelho antes do envio
export const PHOTO_MAX_BYTES = 3 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const photoUrl = (id: string) => `/api/fotos/${id}`;

/**
 * Reduz a foto no navegador e regrava como JPEG. Regravar pelo canvas também
 * remove os metadados (EXIF), inclusive a localização GPS da foto.
 */
export async function resizeImage(file: File, maxSide = PHOTO_MAX_SIDE, quality = 0.82): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();
  const blob = await new Promise<Blob>((ok, fail) => canvas.toBlob((b) => (b ? ok(b) : fail(new Error("Falha ao converter a imagem"))), "image/jpeg", quality));
  return { blob, width, height };
}
