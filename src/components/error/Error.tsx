import React from "react";
import errorSrc from "../../resources/img/error.png";

export const Error: React.FunctionComponent = () => {
  return (
    <div className="errorDiv">
      <img src={errorSrc} alt="error" width="400px" style={{marginTop: "30px"}} />
    </div>
  );
};
