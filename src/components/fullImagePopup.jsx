import React from 'react';
import { Block, Button, Popup } from 'framework7-react';
import { IoMdClose } from 'react-icons/io';

const FullImagePopup = ({ opened, onClose, imageSrc }) => {

    return (
        <Popup
            opened={opened}
            onPopupClose={onClose}
            style={{
                display: opened ? "flex" : "none",
                justifyContent: "center",
                alignItems: "center",
                background: "rgba(0,0,0,0.8)"
            }}
        >
            <Block style={{ padding: "0", margin: "0", width: "100%", height: "100%" }}>
                <div style={{ position: "absolute", top: 30, right: 10, zIndex: 10 }}>
                    <button onClick={onClose} style={{ background: "rgba(0,0,0,0.5)", borderRadius: "100%", border: "none", color: "white", display: "flex", padding: "6px" }}>
                        <IoMdClose size={"20px"} />
                    </button>
                </div>
                <img
                    src={imageSrc}
                    alt="Full Document"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
            </Block>
        </Popup>
    );
};

export default FullImagePopup;
