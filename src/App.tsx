import React from "react";
import { Route, Routes } from "react-router-dom";
import "./App.scss";
import { Header } from "./components/header/Header";
import { Trains } from "./components/trainsList/TrainsList";
import { Signin } from "./components/signin/Signin";
import { Signup } from "./components/signup/Signup";
import { Account } from "./components/account/Account";
import { NotFound } from "./components/notFound/NotFound";
import { Train } from "./components/train/Train";
import { EditCreateTrain } from "./components/editCreateTrain/EditCreateTrain";

///
/// FR - Add integration with react-toastify
///

const App: React.FunctionComponent = () => {
  return (
    <div className="main">
      <Routes>
        <Route path="/" element={<Header />}>
          <Route index element={<Trains />} />
          <Route path="trains/:trainId" element={<Train />} />
          <Route path="trains/edit/:trainId" element={<EditCreateTrain />} />
          <Route path="trains/create" element={<EditCreateTrain />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </div>
  );
};

export default App;
