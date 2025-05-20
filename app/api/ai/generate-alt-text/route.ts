import { NextResponse } from "next/server";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

export async function POST(request: Request) {
  // Always use mock data in browser or if mock mode is enabled
  const useMock =
    isBrowser ||
    request.headers.get("x-use-mock") === "true" ||
    process.env.USE_MOCK_API === "true";

  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 },
      );
    }

    if (useMock) {
      // In mock mode, generate a descriptive alt text based on the URL
      const fileName = imageUrl.split("/").pop() || "";
      const fileNameWithoutExt = fileName.split(".")[0] || "";

      // Create a more descriptive alt text from the filename
      const words = fileNameWithoutExt
        .replace(/[-_]/g, " ")
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .trim();

      // Add some variety to mock responses
      const mockDescriptions = [
        `A detailed image showing ${words}`,
        `Photograph depicting ${words} in high resolution`,
        `Illustration of ${words} with detailed elements`,
        `Visual representation of ${words} in context`,
        `Close-up view of ${words} with clear details`,
      ];

      const randomIndex = Math.floor(Math.random() * mockDescriptions.length);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return NextResponse.json({
        altText: mockDescriptions[randomIndex],
      });
    }

    // For real implementation, use Google's Gemini API
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 },
      );
    }

    // Dynamically import Google AI SDK only on the server
    const { GoogleGenerativeAI } = await import("@google/generative-ai");

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Fetch the image and convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mimeType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Create the prompt for Gemini
    const prompt =
      "Generate a detailed and descriptive alt text for this image for accessibility purposes. Keep it concise but informative.";

    // Generate content with the image
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const altText = response.text();

    return NextResponse.json({ altText });
  } catch (error) {
    console.error("Error generating alt text:", error);
    return NextResponse.json(
      { error: "Failed to generate alt text" },
      { status: 500 },
    );
  }
}
