import React from "react";
import { Link } from "react-router-dom";
import "./TrainItem.scss";
import { ITrainItemProps } from "./interfaces/train-item-props.interface";

export const TrainItem: React.FunctionComponent<ITrainItemProps> = (
  props: ITrainItemProps
) => {
  return (
    <div key={props.id} className="train">
      <div className="trainPlain">
        <div>
          <p>{props.departureDate}</p>
          <p>{props.departureCity}</p>
        </div>
        <span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25">
            <path
              fill="rgba(240, 141, 242)"
              d="m17.5 5.999-.707.707 5.293 5.293H1v1h21.086l-5.294 5.295.707.707L24 12.499l-6.5-6.5z"
              data-name="Right"
            />
          </svg>
        </span>
        <div>
          <p>{props.arrivalDate}</p>
          <p>{props.arrivalCity}</p>
        </div>
      </div>
      <Link to={`/trains/${props.id}`}>
        <div className="trainHover">Details</div>
      </Link>
    </div>
  );
};
