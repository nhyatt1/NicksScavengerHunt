import { createSlice } from '@reduxjs/toolkit';

const tokenSlice = createSlice({
    name: 'token',
    initialState: {
        tokens: []
        //tokens should import as a string
    },
    
    reducers: {
        addToken: (state, action) => {
            state.tokens.push(action.payload);
        },
        removeToken: state => {
            state.tokens = [];
        },
    }
});

export const { addToken, removeToken } = tokenSlice.actions;
export default tokenSlice.reducer;