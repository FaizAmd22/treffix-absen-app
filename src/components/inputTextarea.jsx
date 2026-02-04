import { useEffect, useRef } from "react";
import { getBorderColor } from "../functions/getBorderColor";

const InputTextarea = ({
    title,
    id,
    type,
    noMargin,
    value,
    onChange,
    placeholder,
    theme,
    disabled = false,
    error = false,
    errorMessage = "",
}) => {
    const { borderColor, isFocused, handleFocus, handleBlur } = getBorderColor({
        value,
        theme,
        disabled,
        error,
    });

    const textareaRef = useRef(null);

    const adjustHeight = () => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = "auto";
            el.style.height = Math.max(el.scrollHeight, 120) + "px";
        }
    };

    useEffect(() => {
        adjustHeight();
    }, [value]);

    return (
        <div style={{ color: theme === "light" ? "black" : "white" }}>
            {type === "label" ? (
                <label
                    style={{ fontWeight: "600" }}
                    className={noMargin ? "m0" : ""}
                    htmlFor={id}
                >
                    {title}
                </label>
            ) : (
                <p style={{ fontWeight: "600" }} className={noMargin ? "m0" : ""}>
                    {title}
                </p>
            )}

            <textarea
                id={id}
                ref={textareaRef}
                value={value}
                onChange={(e) => {
                    onChange(e);
                    adjustHeight();
                }}
                placeholder={placeholder}
                disabled={disabled}
                onFocus={handleFocus}
                onBlur={handleBlur}
                aria-invalid={error ? "true" : "false"}
                style={{
                    width: "100%",
                    height: "auto",
                    overflow: "hidden",
                    padding: "10px 15px",
                    marginBottom: errorMessage ? "6px" : "10px",
                    borderRadius: "5px",
                    border: `1px solid ${borderColor}`,
                    background: !disabled
                        ? "transparent"
                        : theme === "light"
                            ? "#f0f0f1"
                            : "#202020",
                    color: theme === "light" ? "black" : "white",
                    opacity: disabled ? 0.5 : 1,
                    transition: "border-color 0.2s ease",
                    boxShadow: isFocused ? "0 3px 8px 0 rgba(0,0,0,0.1)" : "none",
                    resize: "none",
                }}
            />

            {errorMessage ? (
                <p
                    style={{
                        color: "red",
                        fontSize: "12px",
                        marginTop: "-4px",
                        marginBottom: "10px",
                    }}
                >
                    {errorMessage}
                </p>
            ) : null}

            <style jsx>{`
        .m0 {
          margin: 0 !important;
        }
      `}</style>
        </div>
    );
};

export default InputTextarea;
