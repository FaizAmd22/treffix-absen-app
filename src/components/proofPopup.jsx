import React from 'react';
import { Block, Button, List, ListItem, Popup } from 'framework7-react';
import { FiEye } from 'react-icons/fi';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { selectSettings } from '../slices/settingsSlice';
import { translate } from '../utils/translate';
import { selectLanguages } from '../slices/languagesSlice';

const ProofPopup = ({
    title,
    opened,
    onClose,
    onViewImage,
    onReplaceImage,
    onDeleteImage
}) => {
    const theme = useSelector(selectSettings)
    const language = useSelector(selectLanguages)

    return (
        <Popup
            opened={opened}
            onPopupClose={onClose}
            style={{ top: '64%', borderRadius: '12px 12px 0 0', background: theme == "light" ? "var(--bg-primary-white)" : "var(--bg-secondary-black)" }}
        >
            <Block style={{ padding: 0, margin: 0, color: theme == "light" ? "black" : "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px 0 20px", fontSize: "var(--font-lg)", fontWeight: 700, marginTop: "-10px" }}>
                    <p>{title}</p>

                    <Button style={{ border: "none", color: theme === "light" ? "black" : "white", padding: 0, margin: 0 }} onClick={onClose}>
                        <IoMdClose size={"20px"} />
                    </Button>
                </div>
                <List menuList style={{ margin: 0, padding: 0, fontSize: "var(--font-sm)" }}>
                    <ListItem>
                        <Button
                            style={{ color: theme == "light" ? "black" : "white", textTransform: 'capitalize' }}
                            onClick={() => {
                                onViewImage();
                                onClose();
                            }}
                        >
                            <FiEye size={'20px'} style={{ marginRight: '10px' }} />
                            {translate('view_image', language)}
                        </Button>
                    </ListItem>
                    <ListItem>
                        <Button
                            style={{ color: theme == "light" ? "black" : "white", textTransform: 'capitalize' }}
                            onClick={() => {
                                onReplaceImage();
                                onClose();
                            }}
                        >
                            {translate('change_image', language)}
                        </Button>
                    </ListItem>
                    <ListItem>
                        <Button
                            style={{ color: theme == "light" ? "black" : "white", textTransform: 'capitalize' }}
                            onClick={() => {
                                onDeleteImage();
                                onClose();
                            }}
                        >
                            {translate('remove_image', language)}
                        </Button>
                    </ListItem>
                </List>
            </Block>
        </Popup>
    );
};

export default ProofPopup;
