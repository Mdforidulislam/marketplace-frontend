/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const apiBaseUrl = import.meta.env.VITE_BASE_URL_production;

interface Review {
  postId: string;
  userId: string;
  rating: number;
  description: string;
}

// Initial state for the slice
const initialState: {
  reviews: Review[];
  loading: boolean;
  error: string | null;
} = {
  reviews: [],
  loading: false,
  error: null,
};

// Async thunk to add or update a comment
export const addOrUpdateReview = createAsyncThunk(
  "reviews/addOrUpdateReview",
  async (
    reviewData: {
      post: {
        postId: string;
        userId: string;
        rating: number;
        description: string;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.put(
        `${apiBaseUrl}/comment-post`,
        reviewData
      );
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addOrUpdateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addOrUpdateReview.fulfilled, (state, action) => {
        state.loading = false;
        const updatedReview = action.payload;

        const existingReviewIndex = state.reviews.findIndex(
          (review) => review.postId === updatedReview.postId
        );

        if (existingReviewIndex >= 0) {
          state.reviews[existingReviewIndex] = updatedReview;
        } else {
          // Add new review
          state.reviews.push(updatedReview);
        }
      })

      .addCase(addOrUpdateReview.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Failed to add or update comment";
      });
  },
});

export default reviewSlice.reducer;
