import {SORT_FIELDS} from "../Constants";

export const SortButtons = ({handleClickSortButtons}) => {
    return (
        <div>
            {Object.entries(SORT_FIELDS).map(([k, sortField]) => (
                <button type="button" key={k} value={sortField} onClick={() => handleClickSortButtons(sortField)}>
                    {sortField}
                </button>
            ))}
        </div>
    )
}

export default SortButtons;
