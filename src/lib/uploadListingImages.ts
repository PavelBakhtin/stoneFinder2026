import { createClient } from "@/lib/supabase/client";

const MAX_IMAGES = 3;
const MAX_FILE_SIZE = 6 * 1024 * 1024;

export async function uploadListingImages(files: File[]): Promise<string[]> {
  if (files.length > MAX_IMAGES) {
    throw new Error("Можна завантажити максимум 3 фотографії");
  }

  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Для завантаження фотографій потрібно увійти");
  }

  const imageUrls: string[] = [];
  const uploadedPaths: string[] = [];

  try {
    for (const [index, file] of files.entries()) {
      if (!file.type.startsWith("image/")) {
        throw new Error(`Файл "${file.name}" не є зображенням`);
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Файл "${file.name}" перевищує допустимий розмір 6 МБ`);
      }

      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${crypto.randomUUID()}-${index}.${extension}`;
      const filePath = `listings/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      uploadedPaths.push(filePath);

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filePath);

      imageUrls.push(data.publicUrl);
    }

    return imageUrls;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      await supabase.storage.from("listing-images").remove(uploadedPaths);
    }

    throw error;
  }
}
