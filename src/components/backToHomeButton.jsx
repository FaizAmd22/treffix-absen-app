import { Link, f7 } from 'framework7-react'
import React from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { selectSettings } from '../slices/settingsSlice'
import { setActiveTab } from '../slices/tabSlice'

const BackToHomeButton = ({ label }) => {
    const theme = useSelector(selectSettings)
    const dispatch = useDispatch()

    const BackToHome = () => {
        dispatch(setActiveTab('view-home'))
        f7.views.main.router.navigate('/home/', {
            clearPreviousHistory: true,
        });
    }

    return (
        <Link onClick={BackToHome} style={{ color: theme === "light" ? "black" : "white" }}>
            <IoIosArrowRoundBack size={"25px"} style={{ marginRight: "10px" }} />
            <p style={{ fontSize: "var(--font-lg)", fontWeight: "600" }}>{label}</p>
        </Link>
    )
}

export default BackToHomeButton