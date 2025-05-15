import { useMutation } from "@tanstack/react-query";

const generateAltText = async (
  imageUrl: string
): Promise<{ altText: string }> => {
  const response = await fetch("/api/ai/generate-alt-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate alt text");
  }

  return response.json();
};

export const useGenerateAltTextMutation = () => {
  return useMutation({
    mutationFn: generateAltText,
  });
};
