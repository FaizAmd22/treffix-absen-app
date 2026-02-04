import { configureStore } from "@reduxjs/toolkit";
import settingsSlice from "../slices/settingsSlice";
import productSlice from "../slices/productSlice";
import notificationSlice from "../slices/notificationSlice";
import verificationSlice from "../slices/verficationSlice";
import userSlice from "../slices/userSlice";
import absentSlice from "../slices/absentSlice";
import languagesSlice from "../slices/languagesSlice";
import testSlice from "../slices/testSlice";
import payloadSlice from "../slices/payloadSlice";
import questionsSlice from "../slices/questionsSlice ";
import visitSlice from "../slices/visitSlice";
import otpSlice from "../slices/otpSlice";
import tabSlice from "../slices/tabSlice";
import overtimeSlice from "../slices/overtimeSlice";
import requestBodySlice from "../slices/requestBodySlice";
import countNotifSlice from "../slices/countNotifSlice";
import tabTrainingSlice from "../slices/tabTrainingSlice";
import tabNotifSlice from "../slices/tabNotifSlice";


const store = configureStore({
  reducer: {
    settings: settingsSlice,
    products: productSlice,
    notifications: notificationSlice,
    verification: verificationSlice,
    users: userSlice,
    absent: absentSlice,
    visit: visitSlice,
    languages: languagesSlice,
    tests: testSlice,
    payloads: payloadSlice,
    questions: questionsSlice,
    otps: otpSlice,
    tab: tabSlice,
    tabTraining: tabTrainingSlice,
    tabNotif: tabNotifSlice,
    overtime: overtimeSlice,
    requestbody: requestBodySlice,
    countNotif: countNotifSlice,
  },
});

export default store;