
import { DatePickerValue }  from "../DatePicker/DatePicker";
import { Search }           from "../Search/Search";

export const FiltrosData = () => {
    return (
        <>
            <div className="row cardFilters mt-3">
                <div className="col-12 col-md-4 mb-3 mb-md-0">
                    <Search />
                </div>
                <div className="col-12 col-md-8">
                    <DatePickerValue />
                </div>
            </div>
        </>
    )

}