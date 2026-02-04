import { Button } from "framework7-react";
import { HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { getBorderColor } from "../functions/getBorderColor";

const InputPassword = ({ title, isVisible, id, value, placeholder, onChange, onClick, theme, disabled = false, error = false, errorMessage = "" }) => {
    const { borderColor, isFocused, handleFocus, handleBlur } = getBorderColor({ value, theme, disabled, error });

    return (
        <div>
            <label style={{ fontWeight: 600 }} htmlFor={id}>
                {title}
            </label>

            <div
                style={{
                    position: "relative",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    border: `1px solid ${borderColor}`,
                    backgroundColor: !disabled
                        ? "transparent"
                        : theme === "light"
                            ? "#f0f0f1"
                            : "#202020",
                    opacity: disabled ? 0.5 : 1,
                    transition: "border-color 0.2s ease",
                    boxShadow: isFocused
                        ? "0 3px 8px 0 rgba(0, 0, 0, 0.1)"
                        : "none",
                }}
            >
                <input
                    type={isVisible ? "text" : "password"}
                    id={id}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    aria-invalid={error ? "true" : "false"}
                    style={{
                        width: "100%",
                        height: "44px",
                        fontSize: "14px",
                        padding: "13px 40px 13px 15px",
                        border: "none",
                        outline: "none",
                        background: "transparent",
                        color: theme === "light" ? "black" : "white",
                    }}
                    // required
                    disabled={disabled}
                />

                <Button
                    onClick={onClick}
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "transparent",
                        boxShadow: "none",
                        minWidth: "auto",
                        height: "auto",
                        padding: 0,
                    }}
                    tooltip={isVisible ? "Hide Password" : "Show Password"}
                >
                    {isVisible ? <HiOutlineEyeOff color="var(--bg-primary-green)" /> : <HiOutlineEye color="var(--bg-primary-green)" />}
                </Button>
            </div>

            {errorMessage ? (
                <p style={{ color: "red", fontSize: "12px", marginTop: "-4px", marginBottom: "10px" }}>
                    {errorMessage}
                </p>
            ) : null}
        </div>
    );
};

export default InputPassword;