import { formatDate } from '../functions/formatDate'
import { FaChevronRight } from 'react-icons/fa';
import { getBorderColor } from '../functions/getBorderColor';
import CalendarIcon from '../icons/calendar';

const InputDate = ({
    title,
    value,
    noValue,
    id,
    onChange,
    theme,
    language,
    disabled = false,
    min = "",
    error = false,
    errorMessage = "",
    maxToday = false,
}) => {
    const { borderColor, isFocused, handleFocus, handleBlur } =
        getBorderColor({ value, theme, disabled, error });

    const handleChange = (e) => {
        if (onChange) onChange(e);
    };

    const today = new Date().toISOString().split("T")[0];

    return (
        <div>
            <label style={{ fontWeight: 600 }} htmlFor={id}>{title}</label>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    border: `1px solid ${borderColor}`,
                    padding: "10px 15px",
                    marginBottom: "6px",
                    borderRadius: "5px",
                    position: "relative",
                    backgroundColor: !disabled
                        ? "transparent"
                        : theme === "light"
                            ? "#f0f0f1"
                            : "#202020",
                    opacity: !disabled ? 1 : 0.5,
                    transition: "border-color 0.2s ease",
                    height: "22px",
                    boxShadow: isFocused ? "0 3px 8px 0 rgba(0,0,0,0.1)" : "none",
                }}
            >
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <CalendarIcon fillColor="var(--bg-primary-green)" width={18} height={18} />
                    <p style={{ margin: 0 }}>
                        {value ? formatDate(value, language) : noValue}
                    </p>
                </div>

                {!disabled ? (<FaChevronRight size={14} color="var(--bg-primary-green)" />) : null}

                <input
                    type="date"
                    id={id}
                    value={value || ""}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    min={min}
                    max={maxToday ? today : undefined}
                    aria-invalid={error ? "true" : "false"}
                    style={{
                        width: "91%",
                        fontSize: "var(--font-sm)",
                        border: "none",
                        outline: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                        appearance: "textfield",
                        position: "absolute",
                        zIndex: 99,
                        opacity: 0,
                    }}
                />
            </div>

            {errorMessage ? (
                <p style={{ color: "red", fontSize: 12, marginTop: 2, marginBottom: 10 }}>
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
};

export default InputDate;
