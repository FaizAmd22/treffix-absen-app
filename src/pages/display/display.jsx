import { Block, List, ListItem, Page, f7 } from 'framework7-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { selectSettings, updateTheme } from '../../slices/settingsSlice'
import { selectLanguages } from '../../slices/languagesSlice'
import { translate } from '../../utils/translate'
import BackButton from '../../components/backButton'
import ButtonFixBottom from '../../components/buttonFixBottom'
import CustomButton from '../../components/customButton'

const DisplayPage = () => {
    const theme = useSelector(selectSettings)
    const dispatch = useDispatch()
    const [selectedTheme, setSelectedTheme] = useState(theme)
    const language = useSelector(selectLanguages)

    const handleThemeChange = (value) => {
        setSelectedTheme(value)
    }

    const handleSave = () => {
        dispatch(updateTheme(selectedTheme))
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
            <Block style={{ margin: 0, paddingTop: "5px", height: "90%", color: theme == "light" ? "black" : "white" }}>
                <BackButton label={translate('display_back_button', language)} />

                <List style={{ marginTop: "20px", fontSize: "var(--font-sm)" }}>
                    <ListItem
                        radio
                        radioIcon="end"
                        value="light"
                        name="demo-radio-start"
                        style={{ color: theme === "light" ? "black" : "white" }}
                        checked={selectedTheme === "light"}
                        onChange={() => handleThemeChange("light")}
                    >
                        <p style={{ color: theme === "light" ? "black" : "white" }}>Light Mode</p>
                    </ListItem>

                    <ListItem
                        radio
                        radioIcon="end"
                        value="dark"
                        name="demo-radio-start"
                        style={{ color: theme === "light" ? "black" : "white" }}
                        checked={selectedTheme === "dark"}
                        onChange={() => handleThemeChange("dark")}
                    >
                        <p style={{ color: theme === "light" ? "black" : "white" }}>Dark Mode</p>
                    </ListItem>
                </List>
            </Block>

            <ButtonFixBottom needBorderTop={false}>
                <CustomButton bg={"var(--bg-primary-green)"} color={"white"} text={translate('save', language)} handleClick={handleSave} />
            </ButtonFixBottom>
        </Page>
    )
}

export default DisplayPage