export interface Product {
  id: string;
  images: string[]; // Maximum of 3 images come on be serious
  title: string;
  stock: number; // Number of items in stock
  description: string;
  price: number;
}

// Define the DynamoDB item structure
export type DynamoDBItem = {
  id: { S: string };
  images: { L: { S: string }[] }; // List of strings
  title: { S: string };
  stock: { N: string }; // Number represented as string
  description: { S: string };
  price: { N: string };
};
