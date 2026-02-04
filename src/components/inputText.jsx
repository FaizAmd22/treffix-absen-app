import { getBorderColor } from "../functions/getBorderColor";

const InputText = ({ icon, type = "text", title, id, value, onChange, placeholder, theme = "light", disabled = false, required = false, isUpdate = true, error = false, errorMessage = "", needLowerCase = false }) => {
    const { borderColor, isFocused, handleFocus, handleBlur } = getBorderColor({ value, theme, disabled, error, type: "text", isUpdate });

    const handleChange = (e) => {
        const inputValue = needLowerCase ? e.target.value.toLowerCase() : e.target.value;
        onChange({
            ...e,
            target: {
                ...e.target,
                value: inputValue,
            },
        });
    };

    return (
        <div>
            <label style={{ fontWeight: "600" }} htmlFor={id}>
                {title}
            </label>

            {icon ? (
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        border: `1px solid ${borderColor}`,
                        backgroundColor:
                            disabled
                                ? theme === "light"
                                    ? "#f0f0f1"
                                    : "#202020"
                                : "transparent",
                        height: "22px",
                        color: theme === "light" ? "black" : "white",
                        opacity: disabled ? 0.5 : 1,
                        transition: "border-color 0.2s ease",
                        boxShadow: isFocused
                            ? "0 3px 8px 0 rgba(0, 0, 0, 0.1)"
                            : "none",
                    }}
                >
                    <div
                        style={{
                            width: "29px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        {icon}
                    </div>

                    <input
                        type={type}
                        id={id}
                        value={value}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        aria-invalid={error ? "true" : "false"}
                        style={{
                            width: "100%",
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            color: theme === "light" ? "black" : "white",
                            fontSize: "var(--font-sm)",
                        }}
                        disabled={disabled || !isUpdate}
                        required={required}
                    />
                </div>
            ) : disabled ? (
                <input
                    type={type}
                    id={id}
                    value={value ? value : "-"}
                    placeholder={placeholder}
                    disabled={true}
                    style={{
                        width: "100%",
                        padding: "10px 15px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        height: "42px",
                        border: `1px solid ${borderColor}`,
                        background: theme === "light" ? "#f0f0f1" : "#202020",
                        color: theme === "light" ? "black" : "white",
                        opacity: 0.5,
                        transition: "border-color 0.2s ease",
                        boxShadow: isFocused ? "0 3px 8px 0 rgba(0, 0, 0, 0.1)" : "none",
                    }}
                />
            ) : (
                <input
                    type={type}
                    id={id}
                    value={disabled && !value ? "-" : value}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    disabled={!isUpdate}
                    required={required}
                    aria-invalid={error ? "true" : "false"}
                    style={{
                        width: "100%",
                        padding: "10px 15px",
                        marginBottom: "10px",
                        borderRadius: "5px",
                        height: "42px",
                        border: `1px solid ${borderColor}`,
                        background: isUpdate ? "transparent" : theme === "light" ? "#f0f0f1" : "#202020",
                        color: theme === "light" ? "black" : "white",
                        opacity: !isUpdate ? 0.5 : 1,
                        transition: "border-color 0.2s ease",
                        boxShadow: isFocused ? "0 3px 8px 0 rgba(0, 0, 0, 0.1)" : "none",
                    }}
                />
            )}

            {errorMessage ? (
                <p style={{ color: "red", fontSize: "12px", marginTop: "-4px", marginBottom: "10px" }}>
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
};

export default InputText;