import { FaChevronRight } from 'react-icons/fa'
import { getBorderColor } from '../functions/getBorderColor';

const InputDropdown = ({
    title,
    value,
    noValue,
    onClick,
    theme,
    isUpdate = false,
    disabled = false,
    error = false,
    errorMessage = "",
}) => {
    const actuallyDisabled = disabled || isUpdate;
    const { borderColor, isFocused, handleFocus, handleBlur } =
        getBorderColor({ value, theme, disabled: actuallyDisabled, error });

    const handleClick = (e) => {
        if (!actuallyDisabled && onClick) onClick(e);
    };

    return (
        <div>
            <label style={{ fontWeight: 600 }}>{title}</label>

            <div
                onClick={handleClick}
                tabIndex={actuallyDisabled ? -1 : 0}
                role="button"
                aria-label={`Select ${title}`}
                onFocus={handleFocus}
                onBlur={handleBlur}
                aria-disabled={actuallyDisabled ? "true" : "false"}
                aria-invalid={error ? "true" : "false"}
                style={{
                    padding: "10px 15px",
                    marginBottom: "6px",
                    borderRadius: "5px",
                    border: `1px solid ${borderColor}`,
                    background: !actuallyDisabled ? "transparent" : (theme === "light" ? "#f0f0f1" : "#202020"),
                    cursor: actuallyDisabled ? "default" : "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    opacity: actuallyDisabled ? 0.5 : 1,
                    transition: "border-color 0.2s ease",
                    height: "22px",
                    outline: "none",
                    boxShadow: isFocused ? "0 3px 8px 0 rgba(0,0,0,0.1)" : "none",
                }}
            >
                {value || noValue}
                {!actuallyDisabled ? <FaChevronRight size={14} color="var(--bg-primary-green)" /> : null}
            </div>

            {errorMessage ? (
                <p style={{ color: "red", fontSize: 12, marginTop: 2, marginBottom: 10 }}>
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
};

export default InputDropdown;
