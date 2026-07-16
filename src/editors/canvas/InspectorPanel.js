import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef } from 'react';
import './panels.css';
const FILL_COLORS = [
    { color: '#fff', label: 'White' },
    { color: 'var(--bg-input)', label: 'Light' },
    { color: 'var(--ink)', label: 'Dark' },
    { color: 'var(--teal-soft)', label: 'Teal' },
];
export default function InspectorPanel({ shape, onChange, }) {
    const wInputRef = useRef(null);
    const hInputRef = useRef(null);
    const handleWidthChange = () => {
        if (wInputRef.current) {
            const value = parseInt(wInputRef.current.value, 10);
            if (!isNaN(value) && value >= 20) {
                onChange({ w: value });
            }
        }
    };
    const handleHeightChange = () => {
        if (hInputRef.current) {
            const value = parseInt(hInputRef.current.value, 10);
            if (!isNaN(value) && value >= 20) {
                onChange({ h: value });
            }
        }
    };
    const handleColorClick = (color) => {
        onChange({ color });
    };
    if (!shape) {
        return (_jsx("div", { className: "inspector-panel", children: _jsx("div", { className: "inspector-panel__empty", children: "Select an element" }) }));
    }
    return (_jsxs("div", { className: "inspector-panel", children: [_jsx("div", { className: "inspector-panel__section-label", children: "Frame" }), _jsxs("div", { className: "inspector-panel__row", children: [_jsx("span", { className: "inspector-panel__row-label", children: "W" }), _jsx("input", { ref: wInputRef, type: "number", className: "inspector-panel__input", value: shape.w, onChange: handleWidthChange, onBlur: handleWidthChange, min: 20 })] }), _jsxs("div", { className: "inspector-panel__row", children: [_jsx("span", { className: "inspector-panel__row-label", children: "H" }), _jsx("input", { ref: hInputRef, type: "number", className: "inspector-panel__input", value: shape.h, onChange: handleHeightChange, onBlur: handleHeightChange, min: 20 })] }), _jsx("div", { className: "inspector-panel__section-label", children: "Fill" }), _jsx("div", { className: "inspector-panel__swatches", children: FILL_COLORS.map(({ color, label }) => (_jsx("button", { className: `inspector-panel__swatch ${shape.color === color ? 'inspector-panel__swatch--active' : ''}`, style: {
                        backgroundColor: color,
                        borderColor: color === '#fff' ? 'var(--violet)' : 'transparent',
                    }, onClick: () => handleColorClick(color), type: "button", "aria-label": `Fill ${label}` }, label))) }), _jsx("div", { className: "inspector-panel__section-label", children: "Stroke" }), _jsxs("div", { className: "inspector-panel__row", children: [_jsx("span", { className: "inspector-panel__row-label", children: "Weight" }), _jsx("span", { style: { fontWeight: 600 }, children: "2px" })] })] }));
}
