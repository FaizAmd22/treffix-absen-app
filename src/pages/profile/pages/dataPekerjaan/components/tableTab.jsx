import React from 'react'
import { useSelector } from 'react-redux'
import { selectSettings } from '../../../../../slices/settingsSlice'
import { selectLanguages } from '../../../../../slices/languagesSlice'
import { translate } from '../../../../../utils/translate'

const TableTab = ({ data, isLoading }) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    console.log("data level :", data);


    const item = {
        division: "Product",
        department: "IT",
        unit: null,
        section: null,
        sub_section: null
    }

    const isEmpty = (item) => {
        if (!data || data.length == 0 || !item || item.length == 0) {
            return "-"
        } else {
            return item
        }
    }


    return (
        <div>
            {(data && data.length > 0) && (
                data.map((item, index) => (
                    <div key={index}>
                        <FormData item={item} language={language} theme={theme} isEmpty={isEmpty} />
                    </div>
                ))
            )}

            {!data && (
                <FormData item={item} language={language} theme={theme} isEmpty={isEmpty} />
            )}
        </div>
    )
}

export default TableTab


const FormData = ({ item, language, theme, isEmpty }) => (
    <form style={{ fontSize: "var(--font-sm)", marginTop: "20px", marginBottom: "50px" }}>
        <label style={{ fontWeight: 600 }}>{translate('division', language)}</label>
        <div
            style={{
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: theme === "light" ? "1px solid #ccc" : "1px solid #202020",
                background: theme == "light" ? "#D9DADC" : "#202020"
            }}
        >
            {isEmpty(item.level_name)}
        </div>

        <label style={{ fontWeight: 600 }}>Department</label>
        <div
            style={{
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: theme === "light" ? "1px solid #ccc" : "1px solid #202020",
                background: theme == "light" ? "#D9DADC" : "#202020"
            }}
        >
            {isEmpty(item.name)}
        </div>

        <label style={{ fontWeight: 600 }}>Unit</label>
        <div
            style={{
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: theme === "light" ? "1px solid #ccc" : "1px solid #202020",
                background: theme == "light" ? "#D9DADC" : "#202020"
            }}
        >
            {!item.unit ? "-" : item.unit}
        </div>

        <label style={{ fontWeight: 600 }}>Section</label>
        <div
            style={{
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: theme === "light" ? "1px solid #ccc" : "1px solid #202020",
                background: theme == "light" ? "#D9DADC" : "#202020"
            }}
        >
            {!item.section ? "-" : item.section}
        </div>

        <label style={{ fontWeight: 600 }}>Sub Section</label>
        <div
            style={{
                padding: "10px",
                marginBottom: "10px",
                borderRadius: "5px",
                border: theme === "light" ? "1px solid #ccc" : "1px solid #202020",
                background: theme == "light" ? "#D9DADC" : "#202020"
            }}
        >
            {!item.sub_section ? "-" : item.sub_section}
        </div>
    </form>
)