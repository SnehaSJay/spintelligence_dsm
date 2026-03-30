import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { submitBetweenWithinCardEntry, submitCardThickPlaceEntry } from "@/apis/carding";

export const submitCardingBetweenWithin = createAsyncThunk(
    "carding/submitBetweenWithin",
    async (payload, { rejectWithValue }) => {
        try {
            const data = await submitBetweenWithinCardEntry(payload);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const submitCardingCardThickPlace = createAsyncThunk(
    "carding/submitCardThickPlace",
    async (payload, { rejectWithValue }) => {
        try {
            const data = await submitCardThickPlaceEntry(payload);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    data: null,
    isLoading: false,
    error: null,
};

const cardingSlice = createSlice({
    name: "carding",
    initialState,
    reducers: {
        clearCardingState: (state) => {
            state.data = null;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(submitCardingBetweenWithin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(submitCardingBetweenWithin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(submitCardingBetweenWithin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(submitCardingCardThickPlace.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(submitCardingCardThickPlace.fulfilled, (state, action) => {
                state.isLoading = false;
                state.data = action.payload;
            })
            .addCase(submitCardingCardThickPlace.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearCardingState } = cardingSlice.actions;
export default cardingSlice.reducer;
