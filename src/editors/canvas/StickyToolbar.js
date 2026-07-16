import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { STICKY_COLORS } from '../../lib/types';
import './panels.css';
const ROTATIONS = [-3, 2, -2, 3];
export default function StickyToolbar({ activeColor, onPick, canVote, onVote, }) {
    return (_jsxs("div", { className: "sticky-toolbar", children: [STICKY_COLORS.map((color, index) => (_jsx("button", { className: `sticky-toolbar__color ${activeColor === color ? 'sticky-toolbar__color--active' : ''}`, style: {
                    backgroundColor: color,
                    transform: `rotate(${ROTATIONS[index]}deg)`,
                }, onClick: () => onPick(color), type: "button", "aria-label": `Pick color ${color}` }, color))), _jsx("div", { className: "sticky-toolbar__divider" }), _jsx("button", { className: "sticky-toolbar__vote-btn", onClick: onVote, disabled: !canVote, type: "button", children: "Vote" })] }));
}
