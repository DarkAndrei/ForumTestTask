import {HTML_TAGS} from "../Constants";


export const BaseTagButtons = ({handleClickTagButton}) => {
    return (
        <div>
            {Object.entries(HTML_TAGS).map(([k, v]) => (
                <button type="button" key={k} value={v} onClick={() => handleClickTagButton(v)}>
                    {v}
                </button>
            ))}
        </div>
    )
}

export default BaseTagButtons;
