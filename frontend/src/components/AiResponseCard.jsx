const AiResponseCard = ({ content }) => {
  return (
    <div
      className="p-4 rounded-lg shadow-md mb-4 border border-gray-700
         bg-gray-600 break-all"
    >
      <div className="flex items-start">
        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mr-3">
          <span className="text-xs text-gray-200">Lex</span>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-300">
            Lex’s Response
          </h3>
          {Array.isArray(content) ? (
            content.map((part, idx) => (
              <span key={idx + 2} className="text-gray-200">
                {part.content}
              </span>
            ))
          ) : (
            <p className="text-gray-200">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiResponseCard;
