import React from "react";

const BiteCard = ({ title, items, onSelect, selectedItem = null }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden group hover:shadow-lg transition-shadow duration-300">
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 via-white to-blue-50/30">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
          {title}
        </h3>
      </div>

      <div className="px-5 pb-5 pt-4">
        <div className="flex flex-wrap gap-2.5">
          {items.map((item) => {
            const isSelected = selectedItem === item;

            return (
              <button
                key={item}
                onClick={() => onSelect(title, item)}
                className={`
                  group/item relative px-4 py-2 text-sm font-medium rounded-full
                  transition-all duration-200
                  ${
                    isSelected
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/40 scale-[1.02]"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:shadow hover:-translate-y-0.5"
                  }
                `}
              >
                {item}
                {/* subtle shine effect on hover for non-selected */}
                {!isSelected && (
                  <span className="absolute inset-0 rounded-full opacity-0 group-hover/item:opacity-10 bg-gradient-to-r from-blue-400/30 to-transparent pointer-events-none transition-opacity" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BiteCard;