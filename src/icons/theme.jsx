const ThemeIcon = ({ fillColor = "#476BD8", ...others }) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...others}>
            <path d="M14 8H18M21.7147 4H10.2853C9.024 4 8 5.07467 8 6.4V25.6C8 26.9253 9.024 28 10.2853 28H21.7147C22.9773 28 24 26.9253 24 25.6V6.4C24 5.07467 22.9773 4 21.7147 4Z" stroke={fillColor} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
    );
};

export default ThemeIcon;
