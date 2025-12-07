import qwen from "@/lib/openai/qwen";

export const POST = async (request: Request) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const prompt =   "Spotting all the text in the image with line-level, and output in JSON format"

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Determine MIME type
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const min_pixels = 512 * 32 * 32;
    const max_pixels = 2048 * 32 * 32;

    const messages = [
      {
        role: "user" as const,
        content: [
          {
            type: "image_url" as const,
            min_pixels: min_pixels,
            max_pixels: max_pixels,
            image_url: { url: dataUrl },
          },
          { type: "text" as const, text: prompt },
        ],
      },
    ];

    const response = await qwen.chat.completions.create({
      model: "qwen3-vl-235b-a22b-instruct",
      messages: messages,
    });

    return Response.json(response.choices[0].message.content);
  } catch (error) {
    console.error("Error processing file:", error);
    return Response.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
};
