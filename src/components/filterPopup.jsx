import { Block, Button, Popup } from 'framework7-react'
import { IoMdClose } from 'react-icons/io'
import { translate } from '../utils/translate';
import InputMonth from './inputMonth';

const FilterPopup = ({
    isFilterPopup,
    closeFilterPopup,
    applyFilter,
    theme,
    language,
    popupTitle = 'Filter',
    filterSections = [],
    toggleSelection
}) => {
    const renderFilterSection = (section, index) => {
        const {
            type,
            label,
            data,
            selectedValues,
            setSelectedValues,
            periodValue,
            setPeriodValue
        } = section;

        if (type === 'period') {
            return (
                <div key={index}>
                    <InputMonth
                        title={label}
                        id={`month-input-${index}`}
                        onChange={(e) => setPeriodValue(e.target.value)}
                        periodValue={periodValue}
                        placeholder={translate('reimburse_choose_month', language)}
                        language={language}
                        theme={theme}
                    />
                </div>
            );
        }

        return (
            <div key={index}>
                <p style={{ fontSize: "var(--font-md)", fontWeight: 700, marginTop: index > 0 ? "30px" : "0px" }}>
                    {label}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    {(data || []).map((item, itemIndex) => {
                        const itemValue = item.value;
                        const itemLabel = item.label;

                        return (
                            <Button
                                key={itemIndex}
                                onClick={() => toggleSelection(itemValue, selectedValues, setSelectedValues)}
                                style={{
                                    backgroundColor: selectedValues.includes(itemValue) ? 'var(--bg-primary-green)' : theme === "light" ? '#E9E9E9' : "#212121",
                                    color: selectedValues.includes(itemValue) ? 'white' : theme === "light" ? 'black' : "white",
                                    margin: '5px',
                                    padding: "4px 18px",
                                    borderRadius: "360px",
                                    fontSize: "var(--font-xs)",
                                    fontWeight: 700,
                                    textTransform: "capitalize"
                                }}
                            >
                                {itemLabel}
                            </Button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <Popup
            opened={isFilterPopup}
            onPopupClosed={closeFilterPopup}
            style={{
                top: "5%",
                borderRadius: '12px 12px 0 0',
                background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)",
            }}
        >
            <Block style={{ height: "95%", padding: '15px', margin: 0, color: theme === "light" ? "black" : "white", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ fontWeight: 'bold', fontSize: 'var(--font-xl)' }}>
                            {popupTitle}
                        </p>
                        <Button onClick={closeFilterPopup} style={{ background: 'transparent', border: 'none', color: theme === "light" ? "black" : "white" }}>
                            <IoMdClose size={"20px"} />
                        </Button>
                    </div>

                    <div style={{ height: "69vh", overflowY: "auto" }}>
                        {filterSections.map((section, index) => renderFilterSection(section, index))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', marginBottom: "20px", gap: "40px", paddingTop: "10px", fontSize: "var(--font-sm)" }}>
                    <div
                        style={{
                            border: "1px solid var(--bg-primary-green)",
                            background: "none",
                            width: "70%",
                            borderRadius: "8px",
                            textAlign: "center",
                            cursor: "pointer"
                        }}
                        onClick={closeFilterPopup}
                    >
                        <p style={{ color: "var(--bg-primary-green)", fontWeight: 700, padding: "11px 0", margin: 0 }}>
                            {translate('procurement_cancel', language)}
                        </p>
                    </div>
                    <div
                        style={{
                            border: "1px solid var(--bg-primary-green)",
                            background: "var(--bg-primary-green)",
                            width: "70%",
                            borderRadius: "8px",
                            textAlign: "center",
                            cursor: "pointer"
                        }}
                        onClick={applyFilter}
                    >
                        <p style={{ color: "white", fontWeight: 700, padding: "11px 0", margin: 0 }}>
                            {translate('procurement_apply', language)}
                        </p>
                    </div>
                </div>
            </Block>
        </Popup>
    )
}

export default FilterPopup