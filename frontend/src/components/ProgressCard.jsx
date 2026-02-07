import React from "react";

const ProgressCard = ({ title, subtitle, completed, total }) => {
  const safeCompleted = Number.isFinite(completed) ? completed : 0;
  const safeTotal = Number.isFinite(total) && total > 0 ? total : 0;
  const percent =
    safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
          {percent}% complete
        </span>
      </div>

      <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">
        <span className="font-semibold text-gray-800">
          {safeCompleted} / {safeTotal}
        </span>{" "}
        modules completed
      </p>
    </div>
  );
};

export default ProgressCard;

