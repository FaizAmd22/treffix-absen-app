import { useSelector } from "react-redux"
import { selectSettings } from "../slices/settingsSlice"

const LoadingMoreAnimation = () => {
    const theme = useSelector(selectSettings)

    return (
        <div style={{
            textAlign: "center",
            padding: "15px",
            marginTop: "10px",
            fontSize: "var(--font-sm)",
            color: theme === "light" ? "#666" : "#ccc"
        }}>
            <div style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                border: "3px solid rgba(0, 0, 0, 0.1)",
                borderTopColor: theme === "light" ? "var(--bg-primary-green)" : "#fff",
                borderRadius: "50%",
                animation: "spin 1s infinite linear",
                marginRight: "10px",
                verticalAlign: "middle"
            }}></div>
            <style>
                {`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}
            </style>
        </div>
    )
}

export default LoadingMoreAnimation