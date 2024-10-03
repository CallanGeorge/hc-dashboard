import { NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// Configure AWS SDK using environment variables
const s3 = new S3Client({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const files: File[] = formData.getAll("images") as File[];

    if (files.length === 0 || files.length > 3) {
      return NextResponse.json(
        { error: "You must upload between 1 and 3 images" },
        { status: 400 }
      );
    }

    const uploadPromises = files.map(async (file) => {
      const fileBuffer = Buffer.from(await file.arrayBuffer());

      const uploadParams = {
        Bucket: "hc-assets",
        Key: `${Date.now()}_${file.name}`, // Using a unique key with timestamp
        Body: fileBuffer,
        ContentType: file.type,
      };

      const upload = new Upload({
        client: s3,
        params: uploadParams,
      });

      await upload.done();

      return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return NextResponse.json({
      urls: uploadedUrls,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
