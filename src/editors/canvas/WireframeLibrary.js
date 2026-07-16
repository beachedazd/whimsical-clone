import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './panels.css';
const basicItems = [
    {
        label: 'Button',
        kind: 'wf-button',
        icon: (_jsx("div", { style: {
                width: 44,
                height: 16,
                background: '#2a2830',
                borderRadius: 8,
            } })),
    },
    {
        label: 'Input',
        kind: 'wf-input',
        icon: (_jsx("div", { style: {
                width: 44,
                height: 16,
                border: '1.5px solid #b6b2bd',
                borderRadius: 4,
            } })),
    },
    {
        label: 'Text',
        kind: 'wf-text',
        icon: (_jsx("div", { style: {
                width: 44,
                height: 6,
                background: '#b6b2bd',
                borderRadius: 3,
                boxShadow: '0 10px 0 #d9d6d0',
            } })),
    },
    {
        label: 'Image',
        kind: 'wf-image',
        icon: (_jsx("div", { style: {
                width: 36,
                height: 26,
                background: 'repeating-linear-gradient(45deg, #e6e3dd, #e6e3dd 4px, #efede8 4px, #efede8 8px)',
                borderRadius: 4,
                border: '1px solid #d9d6d0',
            } })),
    },
    {
        label: 'Toggle',
        kind: 'wf-toggle',
        icon: (_jsx("div", { style: {
                width: 28,
                height: 16,
                background: 'var(--teal)',
                borderRadius: 999,
                position: 'relative',
            }, children: _jsx("div", { style: {
                    position: 'absolute',
                    right: 2,
                    top: 2,
                    width: 12,
                    height: 12,
                    background: '#fff',
                    borderRadius: '50%',
                } }) })),
    },
    {
        label: 'Tabs',
        kind: 'wf-tabs',
        icon: (_jsxs("div", { style: {
                width: 44,
                height: 18,
                border: '1.5px solid #b6b2bd',
                borderRadius: 4,
                display: 'flex',
            }, children: [_jsx("div", { style: {
                        width: '33%',
                        borderRight: '1.5px solid #b6b2bd',
                    } }), _jsx("div", { style: {
                        width: '33%',
                        borderRight: '1.5px solid #b6b2bd',
                    } })] })),
    },
];
const mobileItems = [
    {
        label: 'Phone',
        kind: 'wf-phone',
        icon: (_jsx("div", { style: {
                width: 22,
                height: 38,
                border: '1.5px solid #b6b2bd',
                borderRadius: 5,
            } })),
    },
];
export default function WireframeLibrary({ onAdd }) {
    const handleTileClick = (kind) => {
        onAdd(kind);
    };
    const renderTile = (item) => (_jsxs("button", { className: "wireframe-library__tile", onClick: () => handleTileClick(item.kind), type: "button", "aria-label": `Add ${item.label}`, children: [item.icon, _jsx("span", { className: "wireframe-library__tile-label", children: item.label })] }, item.kind));
    return (_jsxs("div", { className: "wireframe-library", children: [_jsx("input", { type: "text", className: "wireframe-library__search", placeholder: "Search elements\u2026", disabled: true }), _jsx("div", { className: "wireframe-library__section-label", children: "Basics" }), _jsx("div", { className: "wireframe-library__grid", children: basicItems.map(renderTile) }), _jsx("div", { className: "wireframe-library__section-label", children: "Mobile" }), _jsx("div", { className: "wireframe-library__grid", children: mobileItems.map(renderTile) })] }));
}
