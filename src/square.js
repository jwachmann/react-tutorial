import React from "react";

const Square = (props) => (
  <button className={props.isSelected ? "square selected" : "square"} onClick={props.onClick}>
    {props.value}
  </button>
);

export default Square;
