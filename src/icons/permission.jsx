const PermissionIcon = ({ fillColor = "#476BD8", ...others }) => {
    return (
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...others}>
            <path d="M24 5.33332C27.187 7.76973 29.3333 11.6786 29.3333 16C29.3333 23.3638 23.3638 29.3333 16 29.3333C8.63621 29.3333 2.66667 23.3638 2.66667 16C2.66667 11.638 4.76175 7.76589 8 5.33332M16 2.66666V12" stroke={fillColor} stroke-width="1.5" stroke-linecap="round" />
        </svg>
    );
};

export default PermissionIcon;
