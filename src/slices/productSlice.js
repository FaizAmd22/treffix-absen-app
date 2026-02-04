import { createSlice } from "@reduxjs/toolkit";

const initialState = [
    { id: '1', title: 'Apple iPhone 8', description: 'Lorem ipsum dolor sit amet.' },
    { id: '2', title: 'Apple iPhone 8 Plus', description: 'Velit odit autem modi saepe ratione.' },
    { id: '3', title: 'Apple iPhone X', description: 'Expedita sequi perferendis quod illum pariatur.' },
];

const productsSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        addProduct: (state, action) => {
            state.push(action.payload);
        },
    },
});

export const { addProduct } = productsSlice.actions;
export const selectProducts = (state) => state.products;

export default productsSlice.reducer;