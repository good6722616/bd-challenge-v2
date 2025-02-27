import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";

interface ReviewData {
  productId: string;
  rating: number;
  reviewerName: string;
  content: string;
  date: string;
}

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { admin } = await authenticate.public.appProxy(request);
    const reviewData: ReviewData = await request.json();

    // Create a unique key for the review
    const reviewKey = `review_${Date.now()}`;

    // Store review as metafield
    const response = await admin.graphql(
      `mutation CreateReview($input: MetafieldsSetInput!) {
        metafieldsSet(metafields: [$input]) {
          metafields {
            id
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          input: {
            ownerId: reviewData.productId,
            namespace: "product_reviews",
            key: reviewKey,
            value: JSON.stringify({
              rating: reviewData.rating,
              reviewerName: reviewData.reviewerName,
              content: reviewData.content,
              date: reviewData.date,
            }),
            type: "json",
          },
        },
      },
    );

    if (response.errors) {
      throw new Error(response.errors[0].message);
    }

    return json({ success: true, data: response });
  } catch (error) {
    console.error("Error creating review:", error);
    return json({ error: "Failed to create review" }, { status: 500 });
  }
};
