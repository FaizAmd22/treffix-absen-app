import { Block, Button, List, ListItem, Page, f7 } from 'framework7-react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSettings } from '../../slices/settingsSlice'
import { selectLanguages, updateLanguage } from '../../slices/languagesSlice'
import { translate } from '../../utils/translate'
import BackButton from '../../components/backButton'
import ButtonFixBottom from '../../components/buttonFixBottom'
import CustomButton from '../../components/customButton'

const LanguagePage = () => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)
    const [selectedLanguage, setSelectedLanguage] = useState(language)
    const dispatch = useDispatch()

    const handleLanguageChange = (value) => {
        setSelectedLanguage(value)
    }

    const handleSave = () => {
        dispatch(updateLanguage(selectedLanguage))
        f7.views.main.router.navigate('/home/', {
            reloadCurrent: false,
            replaceState: true,
            clearPreviousHistory: true,
            props: {
                targetTab: 'view-profile'
            }
        });
    }

    return (
        <Page style={{ background: theme === "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}>
            <Block style={{ margin: 0, paddingTop: "5px", height: "100%", color: theme === "light" ? "black" : "white" }}>
                <BackButton label={translate('languages_back_button', language)} />

                <List style={{ marginTop: "20px", fontSize: "var(--font-sm)" }}>
                    <ListItem
                        radio
                        radioIcon="end"
                        name="demo-radio-start"
                        value="id"
                        style={{ color: theme === "light" ? "black" : "white" }}
                        checked={selectedLanguage === "id"}
                        onChange={() => handleLanguageChange("id")}
                        defaultChecked
                    >
                        <p style={{ color: theme === "light" ? "black" : "white" }}>{translate('indonesia', language)}</p>
                    </ListItem>

                    <ListItem
                        radio
                        radioIcon="end"
                        name="demo-radio-start"
                        value="en"
                        style={{ color: theme === "light" ? "black" : "white" }}
                        checked={selectedLanguage === "en"}
                        onChange={() => handleLanguageChange("en")}
                    >
                        <p style={{ color: theme === "light" ? "black" : "white" }}>{translate('inggris', language)}</p>
                    </ListItem>
                </List>
            </Block>

            <ButtonFixBottom needBorderTop={false}>
                <CustomButton bg={"var(--bg-primary-green)"} color={"white"} text={translate('save', language)} handleClick={handleSave} />
            </ButtonFixBottom>
        </Page>
    )
}

export default LanguagePage