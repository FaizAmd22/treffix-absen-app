import { useState } from "react";

export const getBorderColor = ({ value, theme, disabled = false, error = false, type = "nonText", isUpdate = false }) => {
    const [isFocused, setIsFocused] = useState(false);

    const getBorderColor = () => {
        if (type == "text") {
            if (disabled || !isUpdate) return theme === "light" ? "#E5E5E5" : "#363636";
        } else {
            if (disabled) return theme === "light" ? "#E5E5E5" : "#363636";
        }

        if (error) return "#DD5555";
        if (isFocused) return "#6996E9";
        if (value) return "#54D776";
        return theme === "light" ? "#E5E5E5" : "#363636";
    };

    const handleFocus = () => {
        if (type == "text") {
            if (!disabled && isUpdate) setIsFocused(true);
        } else {
            if (!disabled) setIsFocused(true);
        }
    };

    const handleBlur = () => setIsFocused(false);

    return { borderColor: getBorderColor(), isFocused, handleFocus, handleBlur };
};
