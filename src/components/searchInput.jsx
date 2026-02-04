import { BiSearchAlt } from 'react-icons/bi'
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2'
import { Button } from 'framework7-react'

const SearchInput = ({ placeholder, value, onChange, theme, openFilterPopup }) => {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "20px", marginTop: "20px" }}>
            <div style={{ width: "85%", display: "flex", color: "var(--bg-primary-green)", gap: "10px", alignItems: "center", border: theme === "light" ? "1px solid var(--border-primary-gray)" : "1px solid #363636", padding: "10px 15px", borderRadius: "8px" }}>
                <BiSearchAlt size={"16px"} />
                <input
                    type="text"
                    id="search"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    style={{ width: "100%", fontSize: "var(--font-sm)", color: theme === "light" ? "black" : "white" }}
                />
            </div>

            <Button onClick={openFilterPopup}>
                <HiOutlineAdjustmentsHorizontal size={"24px"} color='var(--bg-primary-green)' />
            </Button>
        </div>
    )
}

export default SearchInput