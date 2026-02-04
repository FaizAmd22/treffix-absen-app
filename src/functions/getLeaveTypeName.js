export const getLeaveTypeName = (data, leaveTypes) => {
    if (!Array.isArray(leaveTypes)) return data.type_of_leave || '';
    if (!data.type_of_leave) return '';

    const foundType = leaveTypes.find(type =>
        type.id === data.type_of_leave ||
        type.code === data.type_of_leave
    );

    return foundType ? foundType.name : data.type_of_leave;
};