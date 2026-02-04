const NoData = ({ image, title, message }) => {
    return (
        <div style={{ height: "60vh", width: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", marginTop: "20px" }}>
            <img src={image} style={{ width: "90%", objectFit: "cover" }} />
            <p style={{ fontSize: "var(--font-md)", fontWeight: 700, marginTop: "-50px", marginBottom: "5px" }}>{title}</p>
            <p style={{ fontSize: "var(--font-sm)", margin: 0, marginBottom: "10px" }}>{message}</p>
        </div>
    )
}

export default NoData