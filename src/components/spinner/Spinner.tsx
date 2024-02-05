import React from "react";
import spinnerSrc from "../../resources/img/spinner.gif";

export const Spinner: React.FunctionComponent = () => {
  return (
    <div className="spinnerDiv">
      <img src={spinnerSrc} alt="spinner" />
    </div>
  );
};
