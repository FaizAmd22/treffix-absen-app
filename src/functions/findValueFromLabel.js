export const findValueFromLabel = (options, label) => {
    const option = options.find(opt => opt.label === label);
    return option ? option.value : label;
};