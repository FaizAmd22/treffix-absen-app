export const inputFilterConvert = (type) => {
    if (type == "elektronic") {
        return "elektronik"
    } else if (type == "office tool") {
        return "alat kantor"
    } else if (type == "vehicle") {
        return "kendaraan"
    } else {
        return type
    }
}