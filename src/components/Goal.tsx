import React from "react";

let done = 0;
let heveToBeDone = 5;
const Goal = () => {
  return (
    <div className=" ">
      <p className="Goal tab">
        {done}/{heveToBeDone}
      </p>
    </div>
  );
};

export default Goal;
