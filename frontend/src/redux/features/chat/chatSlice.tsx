import { createSlice } from '@reduxjs/toolkit';
 
export interface ChatState {
  isEstablishingConnection: boolean;
  isConnected: boolean;
}
 
const initialState: ChatState = {
  isEstablishingConnection: false,
  isConnected: false
};
 
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    startConnecting: (state => {
      state.isEstablishingConnection = true;
    }),
    connectionEstablished: (state => {
      state.isConnected = true;
      state.isEstablishingConnection = true;
    }),
  },
});
 
export const chatActions = chatSlice.actions;
 
export default chatSlice;