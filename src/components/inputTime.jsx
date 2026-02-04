import { FaChevronRight, FaRegClock } from "react-icons/fa";
import { getBorderColor } from "../functions/getBorderColor";

const InputTime = ({ title, value, noValue, id, onChange, min = "", theme, disabled = false, error = false }) => {
    const { borderColor, isFocused, handleFocus, handleBlur } = getBorderColor({ value, theme, disabled, error });

    return (
        <div>
            <label style={{ fontWeight: 600 }} htmlFor={id}>
                {title}
            </label>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    border: `1px solid ${borderColor}`,
                    padding: "10px 15px",
                    marginBottom: "10px",
                    borderRadius: "5px",
                    height: "22px",
                    position: "relative",
                    backgroundColor: disabled
                        ? theme === "light"
                            ? "#f0f0f1"
                            : "#202020"
                        : "transparent",
                    opacity: disabled ? 0.5 : 1,
                    transition: "border-color 0.2s ease",
                    boxShadow: isFocused ? "0 3px 8px 0 rgba(0, 0, 0, 0.1)" : "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FaRegClock
                        size={"16px"}
                        style={{ color: "var(--bg-primary-green)" }}
                    />

                    <p style={{ margin: 0, color: theme === "light" ? "black" : "white", fontSize: "var(--font-sm)" }}>
                        {value ? value : noValue}
                    </p>
                </div>

                <FaChevronRight size={"14px"} color="var(--bg-primary-green)" />

                <input
                    type="time"
                    id={id}
                    style={{
                        width: "92%",
                        fontSize: "var(--font-sm)",
                        border: "none",
                        outline: "none",
                        position: "absolute",
                        zIndex: 99,
                        opacity: 0,
                    }}
                    value={value}
                    onChange={onChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    min={min}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export default InputTime;