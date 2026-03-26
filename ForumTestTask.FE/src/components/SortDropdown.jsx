import {SORT_FIELDS} from "../Constants";
import {useState} from "react";

export const SortDropdown = ({onSortChange, onOrderChange}) => {
    const [open, setOpen] = useState(false);
    const [activeSortKey, setActiveSortKey] = useState("");

    const SORT_ICONS = {
        USER_NAME: "👤",
        EMAIL: "✉️",
        CREATED_AT: "📅",
        DEFAULT: "",
    };

    const handleSelect = (value, key) => {
        onSortChange(value);
        setActiveSortKey(key);
        setOpen(false);
    };

    return (
        <div className="sort-container">
            <div className="sort-dropdown">
                <button
                    className="dropdown-toggle"
                    onClick={() => setOpen((prev) => !prev)}
                >
                    {activeSortKey
                        ? `${SORT_ICONS[activeSortKey]} ${SORT_FIELDS[activeSortKey]}`
                        : "Sort by"}
                </button>

                {open && (
                    <div className="dropdown-menu">
                        {Object.entries(SORT_FIELDS)
                            .map(([key, value]) => (
                                <div
                                    key={key}
                                    className={`dropdown-item ${
                                        activeSortKey === key ? "active" : ""
                                    }`}
                                    onClick={() => handleSelect(value, key)}
                                >
                                    <span className="icon">{SORT_ICONS[key]}</span>
                                    {value}
                                </div>
                            ))}
                    </div>
                )}
            </div>

            <button
                className="reverse-button"
                onClick={() => onOrderChange()}
            >
                {SORT_ICONS.REVERSE} Reverse
            </button>
        </div>
    );
};

export default SortDropdown;
