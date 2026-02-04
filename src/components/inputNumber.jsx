import { getBorderColor } from "../functions/getBorderColor";

const InputNumber = ({
    title,
    value,
    id,
    placeholder,
    onChange,
    theme,
    disabled = false,
    type = "noRupiah",
    error = false,
    errorMessage = "",
    min,
    max,
    step,
}) => {
    const { borderColor, isFocused, handleFocus, handleBlur } =
        getBorderColor({ value, theme, disabled, error });

    const handleChange = (e) => {
        if (onChange) onChange(e);
    };

    const commonWrapperStyle = {
        border: `1px solid ${borderColor}`,
        borderRadius: "5px",
        width: "100%",
        backgroundColor: !disabled ? "transparent" : (theme === "light" ? "#f0f0f1" : "#202020"),
        opacity: disabled ? 0.5 : 1,
        transition: "border-color 0.2s ease",
        boxShadow: isFocused ? "0 3px 8px 0 rgba(0,0,0,0.1)" : "none",
    };

    return (
        <div>
            <label style={{ fontWeight: 600 }} htmlFor={id}>
                {title}
            </label>

            {type === "rupiah" ? (
                <>
                    <div
                        style={{
                            ...commonWrapperStyle,
                            display: "flex",
                            alignItems: "center",
                            height: "24px",
                            padding: "10px 0",
                            marginBottom: "6px",
                        }}
                    >
                        <span style={{ marginRight: 5, fontWeight: 600, marginLeft: 10 }}>Rp</span>
                        <input
                            type="text"
                            id={id}
                            aria-invalid={error ? "true" : "false"}
                            style={{
                                width: "100%",
                                border: "none",
                                outline: "none",
                                fontSize: "var(--font-sm)",
                                background: "transparent",
                                color: theme === "light" ? "black" : "white",
                            }}
                            value={value}
                            placeholder={placeholder}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            disabled={disabled}
                        />
                    </div>
                    {errorMessage ? (
                        <p style={{ color: "red", fontSize: 12, marginTop: 2, marginBottom: 10 }}>
                            {errorMessage}
                        </p>
                    ) : null}
                </>
            ) : (
                <>
                    <input
                        type="number"
                        id={id}
                        value={value}
                        placeholder={placeholder}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        disabled={disabled}
                        aria-invalid={error ? "true" : "false"}
                        min={min}
                        max={max}
                        step={step}
                        // tips: appearance reset agar tombol spinner minimal
                        style={{
                            width: "100%",
                            padding: "10px 15px",
                            marginBottom: "6px",
                            borderRadius: "5px",
                            border: `1px solid ${borderColor}`,
                            background: !disabled ? "rgba(0,0,0,0)" : (theme === "light" ? "#f0f0f1" : "#202020"),
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                            height: "42px",
                            color: theme === "light" ? "black" : "white",
                            opacity: disabled ? 0.5 : 1,
                            transition: "border-color 0.2s ease",
                            boxShadow: isFocused ? "0 3px 8px 0 rgba(0,0,0,0.1)" : "none",
                        }}
                    />
                    {errorMessage ? (
                        <p style={{ color: "red", fontSize: 12, marginTop: 2, marginBottom: 10 }}>
                            {errorMessage}
                        </p>
                    ) : null}
                </>
            )}
        </div>
    );
};

export default InputNumber;
