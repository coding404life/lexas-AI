import React from "react";

const QueryCard = ({ content }) => (
  <div className="flex justify-end">
    <div className="bg-gray-800 p-4 rounded-l-lg">
      <p className="text-right">{content}</p>
    </div>
  </div>
);

export default QueryCard;
