import React from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "./App.scss";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "./components/header/Header";
import { Trains } from "./components/trainsList/TrainsList";
import { Signin } from "./components/signin/Signin";
import { Signup } from "./components/signup/Signup";
import { Account } from "./components/account/Account";
import { NotFound } from "./components/notFound/NotFound";
import { Train } from "./components/train/Train";
import { EditCreateTrain } from "./components/editCreateTrain/EditCreateTrain";
import { Dashboard } from "./components/dashboard/Dashboard";
import { StationsList } from "./components/stationsList/StationsList";
import { Station } from "./components/station/Station";
import { EditCreateStation } from "./components/editCreateStation/EditCreateStation";
import { JourneySearch } from "./components/journeySearch/JourneySearch";

const App: React.FunctionComponent = () => {
  return (
    <>
      <div className="main">
        <Routes>
          <Route path="/" element={<Header />}>
            <Route index element={<Trains />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="trains/:trainId" element={<Train />} />
            <Route path="trains/edit/:trainId" element={<EditCreateTrain />} />
            <Route path="trains/create" element={<EditCreateTrain />} />
            <Route path="stations" element={<StationsList />} />
            <Route path="stations/create" element={<EditCreateStation />} />
            <Route path="stations/edit/:stationId" element={<EditCreateStation />} />
            <Route path="stations/:stationId" element={<Station />} />
            <Route path="search" element={<JourneySearch />} />
            <Route path="account" element={<Account />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
      <ToastContainer theme="dark" />
    </>
  );
};

export default App;
