import {HTML_TAGS} from "../Constants";

export const HtmlTagButtons = ({handleClickTagButton}) => {
    const TAG_ICONS = {
        "i": "𝑖",
        "strong": "𝐁",
        "code": "💻",
        "a": "🔗",
    };

    return (
        <div>
            {Object.entries(HTML_TAGS).map(([key, value]) => (
                <button
                    className="tag-button"
                    type="button"
                    key={key}
                    value={value}
                    onClick={() => handleClickTagButton(value)}
                >
                    {TAG_ICONS[value] || value}
                </button>
            ))}
        </div>
    )
}

export default HtmlTagButtons;
