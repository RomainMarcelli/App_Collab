import React from 'react';

const Tooltip = ({ tooltip }) => {
    if (!tooltip.visible) return null;

    return (
        <div
            className="absolute bg-gray-800 text-white p-2 rounded-md"
            style={{
                left: tooltip.x + 10,
                top: tooltip.y + 10,
                zIndex: 9999,
            }}
        >
            {tooltip.description}
        </div>
    );
};

export default Tooltip;
