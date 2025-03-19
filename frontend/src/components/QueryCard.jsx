import React from "react";

const QueryCard = ({ content }) => {
  // make a card that will display the user's query
  // make a card that will display the response from the AI
  // style using tailwindcss make text into the right side of the screen
  // make the card rounded with no shadow and dark gray bg
  return (
    <div className="flex justify-end">
      <div className="bg-gray-800 p-4 rounded-l-lg">
        <p className="text-right">{content}</p>
      </div>
    </div>
  );
};

export default QueryCard;
