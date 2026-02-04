import { Button } from 'framework7-react'


const CustomButton = ({ handleClick, bg, color, border, text, icon, opacity = 1, disable = false }) => {
    return (
        <Button
            disabled={disable}
            onClick={handleClick ? handleClick : () => { }}
            style={{
                width: "100%",
                backgroundColor: bg,
                color: color,
                border: border ? border : "none",
                fontSize: "var(--font-sm)",
                fontWeight: 700,
                padding: "25px 0px",
                textTransform: "capitalize",
                borderRadius: "8px",
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
                opacity: opacity
            }}
        >
            {icon && <span style={{ marginRight: "10px", display: "flex", justifyContent: "center", alignItems: "center" }}>{icon}</span>}
            {text}
        </Button>
    )
}

export default CustomButton