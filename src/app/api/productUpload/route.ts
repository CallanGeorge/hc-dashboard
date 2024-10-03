import { NextResponse } from "next/server";
import {
  DynamoDBClient,
  PutItemCommand,
  PutItemCommandInput,
} from "@aws-sdk/client-dynamodb";

import { DynamoDBItem } from "@/app/types/Product";

const dynamoDb = new DynamoDBClient({
  region: process.env.REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY!,
    secretAccessKey: process.env.SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    const { id, images, title, stock, description, price } = await req.json();

    if (!id || !images || !title || !stock || !description || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const item: DynamoDBItem = {
      id: { S: id },
      images: { L: images.map((image: string) => ({ S: image })) },
      title: { S: title },
      stock: { N: stock.toString() }, // DynamoDB expects numbers as strings
      description: { S: description },
      price: { N: price.toString() }, // DynamoDB expects numbers as strings
    };

    const params: PutItemCommandInput = {
      TableName: "hc-products",
      Item: item,
    };

    const command = new PutItemCommand(params);
    await dynamoDb.send(command);

    return NextResponse.json({ message: "Product saved successfully" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to save product" },
      { status: 500 }
    );
  }
}
