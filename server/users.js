const users = [];

const addUser = ({ id, name, room }) => {
    name = name.trim().toLowerCase();
    room = room.trim().toLowerCase();

    const existingUser = users.find((user) => user.room === room && user.name === name);
    
    const user = {id, name, room};

    users.push(user);

    return{ user }
}

const removeUser =(id) => {
    const index = users.findIndex((user) => user.id === id);

    if(index !== -1) {
        return users.splice(index, 1)[0];
    }
}

//id를 찾아서 id 배열값을 반환
const getUser = (id) => users.find((user) => user.id === id);

//room에서 모든 사용자 찾는
const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const getUniqueRooms = () => {
    // 사용자 배열에서 중복을 제외한 방 이름 목록을 얻기 위해 Set을 사용
    const uniqueRooms = [...new Set(users.map(user => user.room))];
    return uniqueRooms;
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom, getUniqueRooms };