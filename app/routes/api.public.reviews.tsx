import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { CREATE_REVIEW } from "../graphql/reviews";

interface ReviewData {
  productId: string;
  rating: number;
  reviewerName: string;
  content: string;
  date: string;
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const authResult = await authenticate.public.appProxy(request);

    if (!authResult?.admin) {
      return json({ error: "Authentication failed" }, { status: 401 });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, { status: 405 });
    }

    const reviewData: ReviewData = await request.json();
    const reviewKey = `review_${Date.now()}`;

    const response = await authResult.admin.graphql(
      `
      mutation createReview($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
      {
        variables: {
          input: {
            id: reviewData.productId,
            metafields: [
              {
                namespace: "product_reviews",
                key: `review_${Date.now()}`,
                value: JSON.stringify({
                  rating: reviewData.rating,
                  reviewerName: reviewData.reviewerName,
                  content: reviewData.content,
                  date: reviewData.date,
                }),
                type: "json",
              },
            ],
          },
        },
      },
    );

    return json({ success: true, data: response });
  } catch (error) {
    console.error("Error creating review:", error);
    return json({ error: "Failed to create review" }, { status: 500 });
  }
};
