export interface ReviewMetafield {
  id: string;
  value: string;
  namespace: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export const REVIEW_FRAGMENT = `
  fragment ReviewFields on Metafield {
    id
    namespace
    key
    value
    createdAt
    updatedAt
  }
`;

export const GET_PRODUCT_REVIEWS = `
  query GetProductReviews {
    products(first: 50) {
      edges {
        node {
          id
          title
          metafields(first: 100, namespace: "product_reviews") {
            edges {
              node {
                ...ReviewFields
              }
            }
          }
        }
      }
    }
  }
  ${REVIEW_FRAGMENT}
`;

export const CREATE_REVIEW = `
  mutation CreateProductReview($input: MetafieldInput!) {
    productUpdate(input: {
      id: $productId
      metafields: [{
        namespace: "product_reviews"
        key: $key
        value: $value
        type: "json"
      }]
    }) {
      product {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;
