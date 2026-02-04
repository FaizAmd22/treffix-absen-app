import React from 'react';
import { Block, Button, List, ListItem, Popup } from 'framework7-react';
import { IoMdClose } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { selectSettings } from '../slices/settingsSlice';
import { selectLanguages } from '../slices/languagesSlice';
import { formatRupiah } from '../functions/formatRupiah';

const TypePopup = ({ opened, onClose, options = [], onSelect, typeOption, title }) => {
    const theme = useSelector(selectSettings);
    const language = useSelector(selectLanguages);

    const getOptionText = (option) => {
        if (typeOption === 'number') {
            return formatRupiah(option);
        }
        if (option && typeof option === 'object') {
            return option.label ?? '';
        }
        if (typeof option === 'string') return option;
        return String(option ?? '');
    };

    return (
        <Popup
            opened={!!opened}
            onPopupClose={onClose}
            style={{
                top: '5%',
                borderRadius: '12px 12px 0 0',
                background: theme === 'light' ? 'var(--bg-primary-white)' : 'var(--bg-secondary-black)',
            }}
        >
            <Block style={{ padding: '15px', margin: 0, color: theme === 'light' ? 'black' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                    <p style={{ fontWeight: 'bold', fontSize: 'var(--font-lg)', textTransform: 'capitalize' }}>{title}</p>

                    <Button onClick={onClose} style={{ background: 'transparent', border: 'none', color: theme === 'light' ? 'black' : 'white' }}>
                        <IoMdClose size="20px" />
                    </Button>
                </div>

                <List style={{ padding: 0, margin: 0, height: '80vh', overflow: 'auto', paddingBottom: '65px' }}>
                    {Array.isArray(options) &&
                        options.map((option, index) => {
                            const text = getOptionText(option);
                            return (
                                <ListItem key={index}>
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            justifyContent: 'start',
                                            padding: '10px 0',
                                        }}
                                        onClick={() => onSelect(option, index)}
                                    >
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: 'var(--font-sm)',
                                                fontWeight: 700,
                                                color: theme === 'light' ? 'black' : 'white',
                                                textTransform: 'capitalize',
                                            }}
                                        >
                                            {text}
                                        </p>
                                    </div>
                                </ListItem>
                            );
                        })}
                </List>
            </Block>
        </Popup>
    );
};

export default TypePopup;
