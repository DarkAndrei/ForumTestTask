export const getUserNameByIdAndUsers = (users, id) => {
    if (!users || !id) return;

    const user = users.find(user => user.id === id);

    return user ? user.userName : "";
}
