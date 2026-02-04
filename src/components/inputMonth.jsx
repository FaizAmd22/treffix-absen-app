import { formatPeriodLabel } from "../functions/formatPeriodLabel"
import { translate } from "../utils/translate"
import { FaChevronRight } from "react-icons/fa"
import { getBorderColor } from '../functions/getBorderColor';
import CalendarIcon from "../icons/calendar";

const InputMonth = ({ title, periodValue, id, placeholder, onChange, language, theme, disabled = false }) => {
    const { borderColor, isFocused, handleFocus, handleBlur } = getBorderColor({ periodValue, theme, disabled });

    const handleChange = (e) => {
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <div>
            <p style={{ fontSize: "var(--font-md)", fontWeight: 700 }}>{title}</p>
            <div style={{
                border: `1px solid ${borderColor}`,
                borderRadius: "5px",
                marginTop: "20px",
                height: "45px",
                backgroundColor: !disabled ? "transparent" : (theme === "light" ? "#f0f0f1" : "#202020"),
                opacity: !disabled ? 1 : 0.5,
                transition: "border-color 0.2s ease",
                boxShadow: isFocused ? "0 3px 8px 0 rgba(0, 0, 0, 0.1)" : "none"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                    height: "45px",
                    padding: "0 15px"
                }}>
                    <CalendarIcon fillColor="var(--bg-primary-green)" width={18} height={18} />
                    <div style={{
                        width: "90vw",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <p style={{ margin: 0, fontWeight: 700 }}>
                            {periodValue ? formatPeriodLabel(periodValue) : translate('all_period', language)}
                        </p>

                        {!disabled && (<FaChevronRight size={"16px"} style={{ color: "var(--bg-primary-green)" }} />)}
                    </div>
                </div>

                <input
                    type="month"
                    id={id}
                    placeholder={placeholder}
                    style={{
                        width: "100%",
                        height: "45px",
                        fontSize: "var(--font-sm)",
                        color: theme === "light" ? "black" : "white",
                        backgroundColor: "transparent",
                        border: "none",
                        outline: "none",
                        opacity: 0,
                        marginTop: "-45px",
                        position: "relative"
                    }}
                    value={periodValue || ''}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                />
            </div>
        </div>
    )
}

export default InputMonth