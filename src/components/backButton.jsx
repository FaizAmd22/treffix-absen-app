import { Link } from 'framework7-react'
import React from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { selectSettings } from '../slices/settingsSlice'

const BackButton = ({ label }) => {
    const theme = useSelector(selectSettings)

    const handleRemoveDetail = () => {
        localStorage.removeItem("detail_procurement")
        localStorage.removeItem("detail_reimburse")
        localStorage.removeItem("detail_permission")
    }

    return (
        <Link onClick={handleRemoveDetail} back style={{ color: theme === "light" ? "black" : "white" }}>
            <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
            <p style={{ fontSize: "var(--font-lg)", fontWeight: "600" }}>{label}</p>
        </Link>
    )
}

export default BackButton