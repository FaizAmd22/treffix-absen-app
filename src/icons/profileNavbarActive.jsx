const ProfileNavbarActiveIcon = ({ fillColor = "#476BD8", ...others }) => {
    return (
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" {...others}>
            <path d="M14 2.33337C10.9395 2.33337 8.45837 4.81446 8.45837 7.87504C8.45837 10.9356 10.9395 13.4167 14 13.4167C17.0606 13.4167 19.5417 10.9356 19.5417 7.87504C19.5417 4.81446 17.0606 2.33337 14 2.33337Z" fill={fillColor} />
            <path d="M10.5 15.1667C7.43946 15.1667 4.95837 17.6478 4.95837 20.7084C4.95837 23.769 7.43946 26.25 10.5 26.25H17.5C20.5606 26.25 23.0417 23.769 23.0417 20.7084C23.0417 17.6478 20.5606 15.1667 17.5 15.1667H10.5Z" fill={fillColor} />
        </svg>
    );
};

export default ProfileNavbarActiveIcon;
