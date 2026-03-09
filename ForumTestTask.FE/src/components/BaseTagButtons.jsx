export const BaseTagButtons = ({handleClickTagButton}) => {
    const Tag = {
        ANCHOR: "a",
        CODE: "code",
        ITALIC: "i",
        STRONG: "strong"
    }
    return (
        <div>
            {Object.entries(Tag).map(([k, v]) => (
                <button type="button" key={k} value={v} onClick={(e) => handleClickTagButton(v)}>
                    {v}
                </button>
            ))}
        </div>
    )
}

export default BaseTagButtons;
